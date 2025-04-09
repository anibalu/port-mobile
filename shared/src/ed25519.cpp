#include "ed25519.h"

#include <vector>
#include <openssl/evp.h>
#include <encoders.h>

std::string ed25519::generate_keys_json()
{
  EVP_PKEY *pkey = nullptr;
  EVP_PKEY_CTX *pctx = EVP_PKEY_CTX_new_id(EVP_PKEY_ED25519, nullptr);
  EVP_PKEY_keygen_init(pctx);
  EVP_PKEY_keygen(pctx, &pkey);
  // Extract private key
  size_t private_key_len = 0;
  EVP_PKEY_get_raw_private_key(pkey, nullptr, &private_key_len);
  auto private_key = std::vector<unsigned char>(private_key_len);
  EVP_PKEY_get_raw_private_key(pkey, private_key.data(), &private_key_len);
  // Extract public key
  size_t public_key_len = 0;
  EVP_PKEY_get_raw_public_key(pkey, nullptr, &public_key_len);
  auto public_key = std::vector<unsigned char>(public_key_len);
  EVP_PKEY_get_raw_public_key(pkey, public_key.data(), &public_key_len);
  std::string private_key_str;
  private_key_str.assign(reinterpret_cast<char *>(private_key.data()), private_key_len);
  std::string public_key_str;
  public_key_str.assign(reinterpret_cast<char *>(public_key.data()), public_key_len);

  std::string private_key_b64 = encoders::base64_encode(private_key_str);
  std::string public_key_b64 = encoders::base64_encode(public_key_str);
  std::string keysJSON = "{\"privateKey\":\"" + private_key_b64 + "\",\"publicKey\":\"" + public_key_b64 + "\"}";

  EVP_PKEY_free(pkey);
  EVP_PKEY_CTX_free(pctx);
  return keysJSON;
}
std::string ed25519::sign_message(const std::string &message, const std::string &private_key_b64)
{
  std::string privateKeyStr = encoders::base64_decode(private_key_b64);
  const unsigned char *privateKeyBytes = reinterpret_cast<const unsigned char *>(privateKeyStr.data());
  size_t privateKeyLen = privateKeyStr.size();
  EVP_PKEY *priv_key = EVP_PKEY_new_raw_private_key(EVP_PKEY_ED25519, nullptr, privateKeyBytes, privateKeyLen);
  std::string signature;
  size_t sig_len;
  unsigned char *sig;
  EVP_MD_CTX *mdctx = EVP_MD_CTX_new();
  if (1 != EVP_DigestSignInit(mdctx, NULL, NULL, NULL, priv_key))
  {
    EVP_PKEY_free(priv_key);
    return "error";
  }
  if (1 != EVP_DigestSign(mdctx, NULL, &sig_len, (const unsigned char *)message.c_str(), message.length()))
  {
    EVP_MD_CTX_free(mdctx);
    EVP_PKEY_free(priv_key);
    return "error";
  }
  sig = (unsigned char *)malloc(sig_len);
  if (1 != EVP_DigestSign(mdctx, sig, &sig_len, (const unsigned char *)message.c_str(), message.length()))
  {
    EVP_MD_CTX_free(mdctx);
    EVP_PKEY_free(priv_key);
    return "error";
  }
  signature.assign((char *)sig, sig_len);
  free(sig);
  EVP_MD_CTX_free(mdctx);
  return encoders::base64_encode(signature);
}