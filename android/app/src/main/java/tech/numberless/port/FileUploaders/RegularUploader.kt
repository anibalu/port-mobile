package tech.numberless.port.fileuploaders

import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.forms.formData
import io.ktor.client.request.forms.submitFormWithBinaryData
import io.ktor.client.request.post
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.Headers
import io.ktor.http.HttpHeaders
import io.ktor.http.isSuccess
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json
import tech.numberless.port.fileuploaders.SingleShotUploader
import java.io.File

/**
 * Data class representing the fields for a non-multipart upload
 * @param key The key for the upload
 * @param policy The policy for the upload
 * @param xAmzAlgorithm The x-amz-algorithm for the upload
 * @param xAmzCredential The x-amz-credential for the upload
 * @param xAmzDate The x-amz-date for the upload
 * @param xAmzSecurityToken The x-amz-security-token for the upload
 * @param xAmzSignature The x-amz-signature for the upload
 */
data class SingleUploadFields(
    val key: String,
    val policy: String,
    @SerializedName("x-amz-algorithm") val xAmzAlgorithm: String,
    @SerializedName("x-amz-credential") val xAmzCredential: String,
    @SerializedName("x-amz-date") val xAmzDate: String,
    @SerializedName("x-amz-security-token") val xAmzSecurityToken: String,
    @SerializedName("x-amz-signature") val xAmzSignature: String,
)

/**
 * Data class representing the response for a non-multipart upload URL request
 * @param statusCode The status code of the response
 * @param body The body of the response
 */
data class SingleUploadURLResponse(
    val statusCode: Int,
    val body: SingleUploadBody,
)

/**
 * Data class representing the body of a non-multipart upload URL response
 * @param url The URL to upload to
 * @param mediaId The media ID
 */
data class SingleUploadBody(
    val url: SingleUploadURLData,
    val mediaId: String,
)

/**
 * Data class representing the URL and fields for a non-multipart upload
 * @param url The URL to upload to
 * @param fields The fields for the upload
 */
data class SingleUploadURLData(
    val url: String,
    val fields: SingleUploadFields,
)

class SingleShotUploader constructor(
    private val presignedFetchResource: String,
) : IUploader {
    override val type = "Single-shot"

    /**
     * Uploads a file to a presigned URL - non-multipart
     * @param client Ktor client
     * @param token Ignored
     * @param path Path to the file to upload
     * @return Media ID
     */
    override suspend fun upload(
        token: String, // Ignored by the backend, in this context
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
        }.use { client ->
            val file =
                File(path).takeIf { it.exists() }
                    ?: throw IllegalArgumentException("File not found: $path")

            val res = client.post(presignedFetchResource)
            if (!res.status.isSuccess()) {
                throw Exception("Fetching presigned URL failed with response ${res.status.value}")
            }
            val (mediaId, urlData) =
                Gson()
                    .fromJson(res.bodyAsText(), SingleUploadURLResponse::class.java)
                    .body
                    .let { it.mediaId to it.url }

            if (!client
                    .submitFormWithBinaryData(
                        url = urlData.url,
                        formData =
                            formData {
                                // Add all fields from UrlData
                                mapOf(
                                    "key" to urlData.fields.key,
                                    "x-amz-algorithm" to urlData.fields.xAmzAlgorithm,
                                    "x-amz-credential" to urlData.fields.xAmzCredential,
                                    "x-amz-date" to urlData.fields.xAmzDate,
                                    "x-amz-security-token" to urlData.fields.xAmzSecurityToken,
                                    "policy" to urlData.fields.policy,
                                    "x-amz-signature" to urlData.fields.xAmzSignature,
                                ).forEach { (key, value) -> append(key, value) }
                                // Add the file
                                append(
                                    "file",
                                    file.readBytes(),
                                    Headers.build {
                                        append(HttpHeaders.ContentType, "application/octet-stream")
                                        append(HttpHeaders.ContentDisposition, "filename=\"${file.name}\"")
                                    },
                                )
                            },
                    ).status
                    .isSuccess()
            ) {
                throw Exception("Uploading file failed")
            }
            return mediaId
        }
    }
}
