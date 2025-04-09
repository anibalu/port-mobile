#include "x25519.h"

#include <vector>
#include <openssl/evp.h>
#include <encoders.h>

std::string x25519::generate_keypair_json()
{
  EVP_PKEY *pkey = nullptr;
  EVP_PKEY_CTX *pctx = EVP_PKEY_CTX_new_id(EVP_PKEY_X25519, nullptr);
  int errcode;
  if (1 != (errcode = EVP_PKEY_keygen_init(pctx)))
    throw std::runtime_error("Failed x25519 keygen init " + std::to_string(errcode));
  if (1 != (errcode = EVP_PKEY_keygen(pctx, &pkey)))
    throw std::runtime_error("Failed x25519 keygen " + std::to_string(errcode));

  // Extract private key
  size_t private_key_len = 0;
  EVP_PKEY_get_raw_private_key(pkey, nullptr, &private_key_len);
  auto private_key = std::vector<unsigned char>(private_key_len);
  if (1 != (errcode = EVP_PKEY_get_raw_private_key(pkey, private_key.data(), &private_key_len)))
    throw std::runtime_error("Could not extract x25519 private key " + std::to_string(errcode));
  // Extract public key
  size_t public_key_len = 0;
  EVP_PKEY_get_raw_public_key(pkey, nullptr, &public_key_len);
  auto public_key = std::vector<unsigned char>(public_key_len);
  if (1 != (errcode = EVP_PKEY_get_raw_public_key(pkey, public_key.data(), &public_key_len)))
    throw std::runtime_error("Could not extract x25519 public key " + std::to_string(errcode));

  std::string privkey_hex = encoders::binary_to_hex(private_key.data(), private_key_len);
  std::string pubkey_hex = encoders::binary_to_hex(public_key.data(), public_key_len);
  std::string keysJSON = "{\"privateKey\":\"" + privkey_hex + "\",\"publicKey\":\"" + pubkey_hex + "\"}";

  EVP_PKEY_free(pkey);
  EVP_PKEY_CTX_free(pctx);

  return keysJSON;
}

std::string x25519::derive_secret(std::string &private_key, std::string &public_key)
{
  try
  {
    // Convert hex keys to binary
    std::string private_key_bin = encoders::hex_to_binary(private_key);
    std::string peer_public_key_bin = encoders::hex_to_binary(public_key);

    // Create and set up the context for the key derivation
    EVP_PKEY_CTX *ctx;
    size_t shared_secret_len = 0;
    EVP_PKEY *local_private_key = NULL, *peer_public_key = NULL;

    // Convert the binary keys to EVP_PKEY structures
    local_private_key = EVP_PKEY_new_raw_private_key(EVP_PKEY_X25519, NULL, reinterpret_cast<const unsigned char *>(private_key_bin.data()), private_key_bin.size());
    peer_public_key = EVP_PKEY_new_raw_public_key(EVP_PKEY_X25519, NULL, reinterpret_cast<const unsigned char *>(peer_public_key_bin.data()), peer_public_key_bin.size());

    if (!local_private_key || !peer_public_key)
    {
      throw std::runtime_error("Error creating keys for shared secret derivation.");
    }

    // Initialize the context
    ctx = EVP_PKEY_CTX_new(local_private_key, NULL);
    if (!ctx)
    {
      throw std::runtime_error("Error creating context for shared secret derivation.");
    }

    // Initialize the key derivation
    if (EVP_PKEY_derive_init(ctx) <= 0)
    {
      throw std::runtime_error("Error initializing shared secret derivation.");
    }

    // Provide the peer public key
    if (EVP_PKEY_derive_set_peer(ctx, peer_public_key) <= 0)
    {
      throw std::runtime_error("Error setting peer key for shared secret derivation.");
    }

    // Determine buffer length for shared secret
    if (EVP_PKEY_derive(ctx, NULL, &shared_secret_len) <= 0)
    {
      throw std::runtime_error("Error determining length of shared secret.");
    }

    // Allocate memory for the shared secret
    auto shared_secret = std::vector<unsigned char>(shared_secret_len);

    // Derive the shared secret
    if (EVP_PKEY_derive(ctx, shared_secret.data(), &shared_secret_len) <= 0)
    {
      throw std::runtime_error("Error deriving shared secret.");
    }

    // Convert the shared secret to a hex string
    std::string shared_secret_hex = encoders::binary_to_hex(shared_secret.data(), shared_secret_len);

    // Clean up
    EVP_PKEY_free(local_private_key);
    EVP_PKEY_free(peer_public_key);
    EVP_PKEY_CTX_free(ctx);

    return shared_secret_hex;
  }
  catch (const std::exception &e)
  {
    return "error";
  }
}
