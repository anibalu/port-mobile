#include "NativeCryptoModule.h"

#include "commonhash.h"
#include "commonrand.h"
#include "ed25519.h"
#include "x25519.h"
#include "aes256.h"
#include <future>
#include <openssl/evp.h>
#include <memory>
namespace facebook::react
{

  NativeCryptoModule::NativeCryptoModule(std::shared_ptr<CallInvoker> jsInvoker)
      : NativeCryptoModuleCxxSpec(std::move(jsInvoker)) {}

  std::string NativeCryptoModule::reverseString(jsi::Runtime &rt, std::string input)
  {
    return std::string(input.rbegin(), input.rend());
  }

  std::string NativeCryptoModule::hashSHA256(jsi::Runtime &rt, std::string input)
  {
    return hash::hashSHA256(input);
  }

  std::string NativeCryptoModule::randHex(jsi::Runtime &rt, double size)
  {
    return commonrand::hex(static_cast<size_t>(size));
  }
  std::string NativeCryptoModule::generateEd25519Keypair(jsi::Runtime &rt)
  {
    return ed25519::generate_keys_json();
  }
  std::string NativeCryptoModule::ed25519SignMessage(jsi::Runtime &rt, std::string message, std::string private_key)
  {
    return ed25519::sign_message(message, private_key);
  }
  std::string NativeCryptoModule::generateX25519Keypair(jsi::Runtime &rt)
  {
    return x25519::generate_keypair_json();
  }
  std::string NativeCryptoModule::deriveX25519Secret(jsi::Runtime &rt, std::string private_key, std::string public_key)
  {
    return x25519::derive_secret(private_key, public_key);
  }
  std::string NativeCryptoModule::aes256Encrypt(jsi::Runtime &rt, std::string plaintext, std::string secret)
  {
    return aes256::encrypt(plaintext, secret);
  }
  std::string NativeCryptoModule::aes256Decrypt(jsi::Runtime &rt, std::string ciphertext, std::string secret)
  {
    return aes256::decrypt(ciphertext, secret);
  }
  jsi::Object NativeCryptoModule::aes256FileEncrypt(jsi::Runtime &rt, std::string path_to_input, std::string path_to_output)
  {
    auto encryptor = [path_to_input, path_to_output, &rt]() -> jsi::Value
    {
      unsigned char key[EVP_MAX_KEY_LENGTH];
      unsigned char iv[EVP_MAX_IV_LENGTH];
      aes256::generate_random_key(key);
      aes256::generate_random_iv(iv);
      auto i_copy = std::string(path_to_input);
      auto o_copy = std::string(path_to_output);
      aes256::encrypt_file(i_copy, o_copy, key, iv);
      return jsi::String::createFromUtf8(rt, aes256::combine_key_and_iv(key, iv));
    };
    return NativeCryptoModule::make_promise(rt, encryptor);
  }

  jsi::Object NativeCryptoModule::aes256FileDecrypt(jsi::Runtime &rt, std::string path_to_input, std::string path_to_output, std::string key_and_iv)
  {
    auto encryptor = [path_to_input,
                      path_to_output,
                      key_and_iv]() -> jsi::Value
    {
      std::string key_bin;
      std::string iv_bin;
      aes256::split_key_and_iv(key_and_iv, key_bin, iv_bin);
      aes256::decrypt_file(path_to_input, path_to_output, key_bin, iv_bin);
      return jsi::Value::undefined();
    };
    return NativeCryptoModule::make_promise(rt, encryptor);
  }

  jsi::Object NativeCryptoModule::make_promise(jsi::Runtime &rt, std::function<jsi::Value()> func)
  {
    auto promiseConstructor = rt.global().getPropertyAsFunction(rt, "Promise");
    auto executor = jsi::Function::createFromHostFunction(
        rt,
        jsi::PropNameID::forAscii(rt, "executor"),
        2, // resolve and reject
        [func](
            jsi::Runtime &rt,
            const jsi::Value &thisVal,
            const jsi::Value *args,
            size_t count) -> jsi::Value
        {
          // JSI functions don't have copy constructors, but the lambda needs to be copyable to be named before being passed
          // into the async launch
          std::shared_ptr<jsi::Function> resolve = std::make_shared<jsi::Function>(args[0].getObject(rt).getFunction(rt));
          std::shared_ptr<jsi::Function> reject = std::make_shared<jsi::Function>(args[1].getObject(rt).getFunction(rt));
          auto worker = [resolve,
                         reject,
                         func,
                         &rt]()
          {
            try
            {
              // Resolve the promise with the result
              resolve->call(rt, func());
            }
            catch (const std::exception &e)
            {
              // Reject the promise with the error
              reject->call(rt, jsi::String::createFromUtf8(rt, "Error during in-place decryption"));
            }
          };

          [[maybe_unused]] std::future fut = std::async(std::launch::async, worker);
          return jsi::Value::undefined();
        });
    return promiseConstructor.callAsConstructor(rt, executor).getObject(rt);
  }

} // namespace facebook::react