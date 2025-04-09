#pragma once
#include <string>

namespace encoders
{
  /// @brief convert a bytearray to a hexadecimal string
  /// @param data byte buffer to encode
  /// @param length the number of bytes to encode
  /// @return a hexadecimal encoding of data
  std::string binary_to_hex(const unsigned char *data, std::size_t length);
  std::string hex_to_binary(std::string &hex);
  std::string base64_decode(const std::string &in);
  std::string base64_encode(const std::string &in);
};