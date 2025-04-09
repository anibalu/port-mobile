#pragma once

#include <string>

namespace x25519
{

  std::string generate_keypair_json();
  std::string derive_secret(std::string &private_key, std::string &public_key);
}
