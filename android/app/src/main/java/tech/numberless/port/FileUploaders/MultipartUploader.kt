package tech.numberless.port.fileuploaders

import android.util.Log
import com.google.gson.Gson
import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.defaultRequest
import io.ktor.client.request.header
import io.ktor.client.request.headers
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.http.isSuccess
import io.ktor.serialization.kotlinx.json.json
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.asFlow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.flow.withIndex
import kotlinx.coroutines.flow.zip
import kotlinx.serialization.json.Json
import org.json.JSONObject
import tech.numberless.port.fileuploaders.SingleShotUploader
import java.io.File
import java.io.RandomAccessFile
import java.util.concurrent.ConcurrentSkipListSet

/**
 * Data class representing the request body for a multipart upload
 * @param mediaId The media ID of the upload
 * @param uploadId The upload ID of the upload
 * @param urls The URLs to upload to
 */
data class MultipartUploadRequestBody(
    val mediaId: String,
    val uploadId: String,
    val urls: List<String>,
)

/**
 * Data class representing a part of a multipart upload
 * @param PartNumber The part number in the multipart upload
 * @param ETag The ETag of the successfully uploaded part
 */
data class Part(
    val PartNumber: Int,
    val ETag: String,
)

/**
 * Data class representing the completion data for a multipart upload
 * @param uploadId The unique ID for this multipart upload
 * @param mediaId The unique media ID
 * @param parts List of parts, each containing part number and ETag
 */
data class MultipartUploadCompletion(
    val uploadId: String,
    val mediaId: String,
    val parts: List<Part>,
)

class MultipartUploader constructor(
    private val numChunks: Int,
    private val partSize: Double,
    private val multipartBeginURL: String,
    private val multipartCompleteURL: String,
    private val multipartAbortURL: String,
    private val defaultMaxRetries: Int = 3,
    private val defaultInitialBackOff: Long = 1000L,
    private val defaultMaxBackoff: Long = 8000L,
) : IUploader {
    override val type = "Multipart"

    /**
     * Generates chunks of a file
     * @param fileUri Path to the file
     * @param partSize Size of each chunk
     * @return Flow of chunks
     */
    fun chunkFileGenerator(
        fileUri: String,
        partSize: Double,
    ): Flow<ByteArray> =
        flow {
            val file = File(fileUri)
            val fileSize = file.length()
            var position = 0L

            RandomAccessFile(file, "r").use { raf ->
                while (position < fileSize) {
                    raf.seek(position)
                    // How many bytes to read
                    val remaining = (fileSize - position).coerceAtMost(partSize.toLong()).toInt()
                    val buffer = ByteArray(remaining)
                    val bytesRead = raf.read(buffer, 0, remaining)
                    if (bytesRead == -1) break // EOF
                    emit(buffer) // Emit the chunk
                    position += bytesRead
                }
            }
        }.flowOn(Dispatchers.IO)

    /**
     * Uploads a chunk with retry logic.
     *
     * @param index Index of the chunk.
     * @param url URL to upload to.
     * @param chunk Chunk to upload.
     * @param successfulChunks Set of successful chunks.
     * @param mediaId Media ID.
     * @param uploadId Upload ID.
     * @param maxRetries Maximum number of retries. Defaults to 3.
     * @param initialBackOff Initial backoff in milliseconds. Defaults to 1000.
     * @param maxBackoff Maximum backoff in milliseconds. Defaults to 10000.
     */
    suspend fun uploadChunk(
        index: Int,
        url: String,
        chunk: ByteArray,
        mediaId: String,
        uploadId: String,
        partDetails: ConcurrentSkipListSet<Part>,
        maxRetries: Int = defaultMaxRetries,
        initialBackOff: Long = defaultInitialBackOff,
        maxBackoff: Long = defaultMaxBackoff,
    ) {
        var attempt = 0
        var currentBackOff = initialBackOff

        // Kotlin favors the iterative approach. A separate function would mean unnecessary parameter drilling.
        // Also, despite docs claiming that HttpClient is threadsafe, somehow the client.put call will
        // consistently throw 400 errors if it is called concurrently. Hence, new clients are declared in the
        // threads.
        HttpClient(CIO) {
            install(ContentNegotiation) {
                json(
                    Json {
                        prettyPrint = true
                        isLenient = true
                    },
                )
            }
        }.use { client ->
            while (attempt < maxRetries) {
                try {
                    val response =
                        client.put(url) {
                            setBody(chunk)
                            contentType(ContentType.Application.OctetStream)
                        }

                    if (response.status.isSuccess()) {
                        val etag =
                            response.headers["ETag"]
                                ?: throw Exception("Upload succeeded but no ETag was returned")
                        partDetails.add(Part(PartNumber = index + 1, ETag = etag))
                        Log.d("PortMediaUploader", "Chunk $index uploaded successfully on attempt ${attempt + 1}.")
                        return // Break early
                    } else {
                        throw Exception("Upload failed with status: ${response.status}")
                    }
                } catch (e: Exception) {
                    Log.d(
                        "PortMediaUploader",
                        "Chunk $index failed on attempt ${attempt + 1} with error: ${e.message}. Retrying in ${currentBackOff / 1000}s...\nFull error is $e",
                    )
                    delay(currentBackOff)
                    currentBackOff = (currentBackOff * 2).coerceAtMost(maxBackoff)
                }
                attempt++
            }
            Log.e("PortMediaUploader", "Chunk $index failed after $maxRetries attempts. Aborting upload.")
            val response: HttpResponse =
                client.post(multipartAbortURL) {
                    setBody(
                        JSONObject(
                            mapOf(
                                "mediaId" to mediaId,
                                "uploadId" to uploadId,
                            ),
                        ).toString(),
                    )
                    contentType(ContentType.Application.Json)
                }
            if (!response.status.isSuccess()) {
                throw Exception(
                    "Upload abortion failed with status ${response.status}: ${response.bodyAsText()}",
                )
            }
        }
    }

    /**
     * Performs the multipart upload process.
     * @param multipartBeginURL The URL for starting multipart uploads.
     * @param multipartCompleteURL The URL for completing multipart uploads.
     * @param multipartAbortURL The URL for aborting multipart uploads.
     * @param path The path of the file to be uploaded.
     * @param numChunks The number of chunks to upload.
     * @param partSize The size of each chunk.
     * @return The media ID
     */
    public override suspend fun upload(
        token: String,
        path: String,
    ): String {
        HttpClient(CIO) {
            install(ContentNegotiation) {
                json(
                    Json {
                        prettyPrint = true
                        isLenient = true
                    },
                )
            }
            defaultRequest {
                header("Authorization", "$token")
            }
        }.use { client ->
            val beginRequest =
                client.post(multipartBeginURL) {
                    setBody(JSONObject(mapOf("parts" to numChunks)).toString())
                    contentType(ContentType.Application.Json)
                }
            if (!beginRequest.status.isSuccess()) {
                throw Exception(
                    "Begin multipart request failed with status ${beginRequest.status}: ${beginRequest.bodyAsText()}",
                )
            }
            val (mediaId, uploadId, urls) =
                Gson().fromJson(
                    beginRequest.bodyAsText(),
                    MultipartUploadRequestBody::class.java,
                )

            val partDetails = ConcurrentSkipListSet<Part>(compareBy { it.PartNumber })
            coroutineScope {
                chunkFileGenerator(path, partSize)
                    .withIndex()
                    .zip(urls.asFlow()) { indexed, url ->
                        Triple(indexed.index, url, indexed.value)
                    }.map { (idx, url, chunk) ->
                        async {
                            uploadChunk(idx, url, chunk, mediaId, uploadId, partDetails)
                        }
                    }.toList()
                    .awaitAll()
            }

            val completeCall =
                client.post(multipartCompleteURL) {
                    setBody(
                        Gson().toJson(
                            MultipartUploadCompletion(
                                uploadId = uploadId,
                                mediaId = mediaId,
                                parts = partDetails.toList(),
                            ),
                        ),
                    )
                    contentType(ContentType.Application.Json)
                }
            if (!completeCall.status.isSuccess()) {
                throw Exception(
                    "Complete multipart request failed with status ${completeCall.status}: ${completeCall.bodyAsText()}",
                )
            }
            return mediaId
            // No uploadAbort necessary. It's handled within the uploadChunk function,
            // and coroutineScope will terminate all jobs if a single one fails. Should this
            // ever change, supervisorScope is the way to go
        }
    }
}
