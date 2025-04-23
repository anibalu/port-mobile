package tech.numberless.port.fileuploaders

interface IUploader {
    val type: String

    suspend fun upload(
        token: String,
        path: String,
    ): String
}
