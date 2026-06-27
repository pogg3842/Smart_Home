#include "BaoMatHMAC.h"
#include "mbedtls/md.h"

String hmacSha256Hex(const String& data, const String& key) {
  byte hmacResult[32];

  mbedtls_md_context_t ctx;
  mbedtls_md_type_t md_type = MBEDTLS_MD_SHA256;

  mbedtls_md_init(&ctx);
  mbedtls_md_setup(&ctx, mbedtls_md_info_from_type(md_type), 1);
  mbedtls_md_hmac_starts(
    &ctx,
    reinterpret_cast<const unsigned char*>(key.c_str()),
    key.length()
  );
  mbedtls_md_hmac_update(
    &ctx,
    reinterpret_cast<const unsigned char*>(data.c_str()),
    data.length()
  );
  mbedtls_md_hmac_finish(&ctx, hmacResult);
  mbedtls_md_free(&ctx);

  char hex[65];
  for (int i = 0; i < 32; i++) {
    sprintf(hex + (i * 2), "%02x", hmacResult[i]);
  }
  hex[64] = '\0';

  return String(hex);
}
