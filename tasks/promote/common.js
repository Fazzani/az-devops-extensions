"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Common = exports.HttpMethod = void 0;
const axios = require("axios");
const tl = require("azure-pipelines-task-lib/task");
const qs = require("qs");
var HttpMethod;
(function (HttpMethod) {
    HttpMethod["Get"] = "get";
    HttpMethod["Post"] = "post";
    HttpMethod["Put"] = "put";
    HttpMethod["Delete"] = "delete";
    HttpMethod["Head"] = "head";
    HttpMethod["PATCH"] = "patch";
})(HttpMethod = exports.HttpMethod || (exports.HttpMethod = {}));
class Common {
    static makeRequest(token, url, payload, params, method = HttpMethod.Get, stringifyData = true) {
        return __awaiter(this, void 0, void 0, function* () {
            tl.debug(`${url}`);
            tl.debug(`${token}`);
            try {
                let data = payload;
                if (payload === undefined && stringifyData)
                    data = qs.stringify(payload);
                const result = yield axios.default({
                    method,
                    url,
                    data,
                    params,
                    auth: {
                        username: token,
                        password: '',
                    },
                });
                return [result.status, result.data];
            }
            catch (error) {
                tl.debug(`${JSON.stringify(error)}`);
                throw error;
            }
        });
    }
}
exports.Common = Common;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29tbW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLCtCQUFnQztBQUNoQyxvREFBb0Q7QUFDcEQseUJBQXlCO0FBRXpCLElBQVksVUFPWDtBQVBELFdBQVksVUFBVTtJQUNwQix5QkFBVyxDQUFBO0lBQ1gsMkJBQWEsQ0FBQTtJQUNiLHlCQUFXLENBQUE7SUFDWCwrQkFBaUIsQ0FBQTtJQUNqQiwyQkFBYSxDQUFBO0lBQ2IsNkJBQWUsQ0FBQTtBQUNqQixDQUFDLEVBUFcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFPckI7QUFFRCxNQUFhLE1BQU07SUFDakIsTUFBTSxDQUFPLFdBQVcsQ0FDdEIsS0FBYSxFQUNiLEdBQVcsRUFDWCxPQUFnQixFQUNoQixNQUFlLEVBQ2YsU0FBcUIsVUFBVSxDQUFDLEdBQUcsRUFDbkMsZ0JBQXlCLElBQUk7O1lBRTdCLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ25CLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3JCLElBQUk7Z0JBQ0YsSUFBSSxJQUFJLEdBQW9CLE9BQU8sQ0FBQztnQkFDcEMsSUFBSSxPQUFPLEtBQUssU0FBUyxJQUFJLGFBQWE7b0JBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBRXpFLE1BQU0sTUFBTSxHQUFHLE1BQU0sS0FBSyxDQUFDLE9BQU8sQ0FBQztvQkFDakMsTUFBTTtvQkFDTixHQUFHO29CQUNILElBQUk7b0JBQ0osTUFBTTtvQkFDTixJQUFJLEVBQUU7d0JBQ0osUUFBUSxFQUFFLEtBQUs7d0JBQ2YsUUFBUSxFQUFFLEVBQUU7cUJBQ2I7aUJBQ0YsQ0FBQyxDQUFDO2dCQUNILE9BQU8sQ0FBRSxNQUE4QixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDOUQ7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZCxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3JDLE1BQU0sS0FBSyxDQUFDO2FBQ2I7UUFDSCxDQUFDO0tBQUE7Q0FDRjtBQS9CRCx3QkErQkMifQ==