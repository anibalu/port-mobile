#include "aes256.h"

#include <fstream>
#include "encoders.h"
#include <openssl/evp.h>
#include <openssl/rand.h>

void aes256::generate_random_key(unsigned char *buffer)
{
  if (RAND_bytes(buffer, EVP_MAX_KEY_LENGTH) != 1)
  {
    throw std::runtime_error("Could not generate a random key for aes256 encryption");
  }
}

void aes256::generate_random_iv(unsigned char *buffer)
{
  if (-1 == RAND_bytes(buffer, EVP_MAX_IV_LENGTH))
  {
    throw std::runtime_error("Could not generate an iv for aes256 encryption");
  }
}

std::string aes256::combine_key_and_iv(unsigned char *key, unsigned char *iv)
{
  auto iv_hex = encoders::binary_to_hex(iv, EVP_MAX_IV_LENGTH);
  auto key_hex = encoders::binary_to_hex(key, EVP_MAX_KEY_LENGTH);
  return iv_hex + key_hex;
}

void aes256::split_key_and_iv(std::string key_and_iv, std::string &key_buf, std::string &iv_buf)
{
  std::string key_and_iv_bin = encoders::hex_to_binary(key_and_iv);
  iv_buf = key_and_iv_bin.substr(0, EVP_MAX_IV_LENGTH);
  key_buf = key_and_iv_bin.substr(EVP_MAX_IV_LENGTH, EVP_MAX_KEY_LENGTH);
}

std::string aes256::encrypt(std::string &plaintext, std::string &key_hex)
{
  // Convert hex keys to binary
  std::string key = encoders::hex_to_binary(key_hex);
  // Generate a random IV
  std::string iv(16, '\0'); // AES block size is 16 bytes
  if (RAND_bytes(reinterpret_cast<unsigned char *>(&iv[0]), 16) != 1)
  {
    // Handle the error
    throw std::runtime_error("RAND_bytes failed to generate secure random bytes.");
  }
  EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();
  if (!ctx)
  {
    throw std::runtime_error("Failed to create cipher context");
  }

  if (1 != EVP_EncryptInit_ex(ctx, EVP_aes_256_cbc(), NULL, reinterpret_cast<const unsigned char *>(key.data()), reinterpret_cast<const unsigned char *>(iv.data())))
  {
    EVP_CIPHER_CTX_free(ctx);
    throw std::runtime_error("Failed to initialize encryption");
  }

  std::string ciphertext;
  ciphertext.resize(plaintext.size() + EVP_MAX_BLOCK_LENGTH);
  int len;
  if (1 != EVP_EncryptUpdate(ctx, reinterpret_cast<unsigned char *>(&ciphertext[0]), &len, reinterpret_cast<const unsigned char *>(plaintext.data()), plaintext.size()))
  {
    EVP_CIPHER_CTX_free(ctx);
    throw std::runtime_error("Failed to encrypt");
  }
  int ciphertext_len = len;

  if (1 != EVP_EncryptFinal_ex(ctx, reinterpret_cast<unsigned char *>(&ciphertext[0]) + len, &len))
  {
    EVP_CIPHER_CTX_free(ctx);
    throw std::runtime_error("Failed to finalize encryption");
  }
  ciphertext_len += len;
  ciphertext.resize(ciphertext_len);

  EVP_CIPHER_CTX_free(ctx);
  // Prepend the IV to the ciphertext
  std::string iv_ciphertext = iv + ciphertext;
  // base 64 encode the encrypted bytes
  std::string iv_ciphertext_b64 = encoders::base64_encode(iv_ciphertext);
  return iv_ciphertext_b64;
}

std::string aes256::decrypt(std::string &ciphertext, std::string &key_hex)
{
  try
  {
    // Convert hex keys to binary
    std::string key = encoders::hex_to_binary(key_hex);
    // convert b64 to binary
    std::string iv_ciphertext = encoders::base64_decode(ciphertext);
    if (iv_ciphertext.size() < 16)
    {
      throw std::runtime_error("The received message is too short to contain an IV and ciphertext");
    }
    std::string iv = iv_ciphertext.substr(0, 16);      // Extract the first 16 bytes as the IV
    std::string ciphertext = iv_ciphertext.substr(16); // The rest is the ciphertext

    EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();
    if (!ctx)
    {
      throw std::runtime_error("Failed to create cipher context");
    }

    if (1 != EVP_DecryptInit_ex(ctx, EVP_aes_256_cbc(), NULL, reinterpret_cast<const unsigned char *>(key.data()), reinterpret_cast<const unsigned char *>(iv.data())))
    {
      EVP_CIPHER_CTX_free(ctx);
      throw std::runtime_error("Failed to initialize decryption");
    }

    std::string plaintext;
    plaintext.resize(ciphertext.size());
    int len;
    if (1 != EVP_DecryptUpdate(ctx, reinterpret_cast<unsigned char *>(&plaintext[0]), &len, reinterpret_cast<const unsigned char *>(ciphertext.data()), ciphertext.size()))
    {
      EVP_CIPHER_CTX_free(ctx);
      throw std::runtime_error("Failed to decrypt");
    }
    int plaintext_len = len;

    if (1 != EVP_DecryptFinal_ex(ctx, reinterpret_cast<unsigned char *>(&plaintext[0]) + len, &len))
    {
      EVP_CIPHER_CTX_free(ctx);
      throw std::runtime_error("Failed to finalize decryption");
    }
    plaintext_len += len;
    plaintext.resize(plaintext_len);

    EVP_CIPHER_CTX_free(ctx);

    return plaintext;
  }
  catch (const std::exception &e)
  {
    return "error";
  }
}

void aes256::encrypt_file(std::string &path_to_input, std::string &path_to_output, unsigned char *key, unsigned char *iv)
{
  std::ifstream in_file(path_to_input, std::ios::binary);
  std::ofstream out_file(path_to_output, std::ios::binary);
  if (!in_file.is_open() || !out_file.is_open())
  {
    throw std::runtime_error("Could not open files to encrypt. Ensure both input and output locations exist and are files");
  }

  // Set up encryption context
  EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();
  if (!ctx)
  {
    throw std::runtime_error("Could not create cipher context");
  }

  // Initialize encryption
  if (EVP_EncryptInit_ex(ctx, EVP_aes_256_cbc(), nullptr, key, iv) != 1)
  {
    EVP_CIPHER_CTX_free(ctx);
    throw std::runtime_error("Could not begin aes 256 encryption");
  }

  unsigned char in_buf[1024], out_buf[1024 + EVP_MAX_BLOCK_LENGTH];
  int bytes_read, encrypted_bytes;

  // Reading in 1024 bytes at a time, encrypt each block and write it to the out buffer
  // From the out buffer,  write it to the output file
  while ((bytes_read = in_file.read(reinterpret_cast<char *>(in_buf), sizeof(in_buf)).gcount()) > 0)
  {
    if (EVP_EncryptUpdate(ctx, out_buf, &encrypted_bytes, in_buf, bytes_read) != 1)
    {
      EVP_CIPHER_CTX_free(ctx);
      throw std::runtime_error("Could not encrypt a block");
    }
    out_file.write(reinterpret_cast<char *>(out_buf), encrypted_bytes);
  }

  // Finalize the encryption, add any padding, terminators and whatnot
  if (EVP_EncryptFinal_ex(ctx, out_buf, &encrypted_bytes) != 1)
  {
    EVP_CIPHER_CTX_free(ctx);
    throw std::runtime_error("Could not finalize encryption");
  }
  out_file.write(reinterpret_cast<char *>(out_buf), encrypted_bytes);

  EVP_CIPHER_CTX_free(ctx);
  in_file.close();
  out_file.close();
}

void aes256::decrypt_file(std::string path_to_input, std::string path_to_output, const std::string key, const std::string iv)
{
  const unsigned char *key_buf = reinterpret_cast<const unsigned char *>(key.data());
  const unsigned char *iv_buf = reinterpret_cast<const unsigned char *>(iv.data());
  EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();
  if (!ctx)
  {
    throw std::runtime_error("Can't create context for aes256 decryption");
  }

  // Set up the decryption context
  if (EVP_DecryptInit_ex(ctx, EVP_aes_256_cbc(), nullptr, key_buf, iv_buf) != 1)
  {
    EVP_CIPHER_CTX_free(ctx);
    throw std::runtime_error("Can't create context for aes256 decryption");
  }

  // Read the input file
  std::ifstream in_stream(path_to_input, std::ios::binary);
  if (!in_stream.is_open())
  {
    EVP_CIPHER_CTX_free(ctx);
    throw std::runtime_error("Can't open input file");
  }
  // Open the output file for writing
  std::ofstream out_stream(path_to_output, std::ios::binary);
  if (!out_stream.is_open())
  {
    EVP_CIPHER_CTX_free(ctx);
    in_stream.close();
    throw std::runtime_error("Can't open output file");
  }

  unsigned char inBuf[1024 + EVP_MAX_BLOCK_LENGTH], outBuf[1024];
  int bytesRead, decryptedBytes;

  // Process the input file in blocks and write the decrypted output
  while ((bytesRead = in_stream.read(reinterpret_cast<char *>(inBuf), sizeof(inBuf)).gcount()) > 0)
  {
    if (EVP_DecryptUpdate(ctx, outBuf, &decryptedBytes, inBuf, bytesRead) != 1)
    {
      EVP_CIPHER_CTX_free(ctx);
      throw std::runtime_error("Error decrypting file");
    }
    out_stream.write(reinterpret_cast<char *>(outBuf), decryptedBytes);
  }

  // Finalize the decryption
  if (EVP_DecryptFinal_ex(ctx, outBuf, &decryptedBytes) != 1)
  {
    EVP_CIPHER_CTX_free(ctx);
    throw std::runtime_error("Error finalizing file decryption");
  }
  out_stream.write(reinterpret_cast<char *>(outBuf), decryptedBytes);

  EVP_CIPHER_CTX_free(ctx);
  out_stream.close();
  in_stream.close();
}
