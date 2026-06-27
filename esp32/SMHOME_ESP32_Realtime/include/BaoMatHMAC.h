#pragma once

#include <Arduino.h>

String hmacSha256Hex(const String& data, const String& key);
