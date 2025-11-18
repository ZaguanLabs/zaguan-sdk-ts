"use strict";
/**
 * Zaguán SDK for TypeScript
 *
 * This is the main entry point for the Zaguán SDK, exporting all public APIs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BandAccessDeniedError = exports.RateLimitError = exports.InsufficientCreditsError = exports.APIError = exports.ZaguanError = exports.ZaguanClient = void 0;
var client_js_1 = require("./client.js");
Object.defineProperty(exports, "ZaguanClient", { enumerable: true, get: function () { return client_js_1.ZaguanClient; } });
var errors_js_1 = require("./errors.js");
Object.defineProperty(exports, "ZaguanError", { enumerable: true, get: function () { return errors_js_1.ZaguanError; } });
Object.defineProperty(exports, "APIError", { enumerable: true, get: function () { return errors_js_1.APIError; } });
Object.defineProperty(exports, "InsufficientCreditsError", { enumerable: true, get: function () { return errors_js_1.InsufficientCreditsError; } });
Object.defineProperty(exports, "RateLimitError", { enumerable: true, get: function () { return errors_js_1.RateLimitError; } });
Object.defineProperty(exports, "BandAccessDeniedError", { enumerable: true, get: function () { return errors_js_1.BandAccessDeniedError; } });
//# sourceMappingURL=index.js.map