class License {
  constructor(licenseKey) {
    this.licenseKey = licenseKey;
    this.licenseServer = "https://your.server/license/verify.php";
    this.secretKey = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    this.name = "exampleApp";
  }

  async requestServer(v1, v2) {
    const url = new URL(
      `${this.licenseServer}?v1=${v1}&v2=${v2}&pl=${this.name}`
    );
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!res.ok) {
      throw new Error(`An error has occurred: ${res.status}`);
    }

    return res.text();
  }

  xor(s1, s2) {
    let result = "";
    const length = Math.min(s1.length, s2.length);
    for (let i = 0; i < length; i++) {
      result += parseInt(s1[i]) ^ parseInt(s2[i]);
    }

    return (
      result +
      (s1.length > s2.length
        ? s1.substr(length, s1.length - length)
        : s2.substr(length, s2.length - length))
    );
  }

  isValidSimple() {
    return this.isValid() === ValidationType.VALID;
  }

  async isValid() {
    const rand = this.toBinary(Math.floor(Math.random() * 1000).toString());
    const sKey = this.toBinary(this.secretKey);
    const key = this.toBinary(this.licenseKey);

    try {
      const response = await this.requestServer(
        this.xor(rand, sKey),
        this.xor(rand, key)
      );

      if (response.startsWith("<")) {
        return ValidationType.PAGE_ERROR;
      }

      if (ValidationType[response]) return ValidationType[response];
      else {
        const respRand = this.xor(this.xor(response, key), sKey);
        if (respRand.substring(0, rand.length) === rand)
          return ValidationType.VALID;
        else return ValidationType.WRONG_RESPONSE;
      }
    } catch (error) {
      console.error(`Unhandled error during license validation: ${error}`);
      return ValidationType.PAGE_ERROR;
    }
  }

  toBinary(s) {
    const bytes = new TextEncoder().encode(s);
    let binary = "";
    for (let b of bytes) {
      for (let i = 7; i >= 0; i--) {
        binary += (b >> i) & 1 ? "1" : "0";
      }
    }
    return binary;
  }
}

const ValidationType = {
  WRONG_RESPONSE: "WRONG_RESPONSE",
  PAGE_ERROR: "PAGE_ERROR",
  URL_ERROR: "URL_ERROR",
  KEY_OUTDATED: "KEY_OUTDATED",
  KEY_NOT_FOUND: "KEY_NOT_FOUND",
  NOT_VALID_IP: "NOT_VALID_IP",
  INVALID_PLUGIN: "INVALID_PLUGIN",
  VALID: "VALID",
};

export { License };
