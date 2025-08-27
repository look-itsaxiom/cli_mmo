"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionTier = exports.TerritoryClaimStatus = void 0;
var TerritoryClaimStatus;
(function (TerritoryClaimStatus) {
    TerritoryClaimStatus["PENDING"] = "pending";
    TerritoryClaimStatus["SUCCESS"] = "success";
    TerritoryClaimStatus["WITHDRAWN"] = "withdrawn";
})(TerritoryClaimStatus || (exports.TerritoryClaimStatus = TerritoryClaimStatus = {}));
var ActionTier;
(function (ActionTier) {
    ActionTier["INFO"] = "info";
    ActionTier["ORDER"] = "order";
    ActionTier["DISTANCE"] = "distance";
    ActionTier["TIMER"] = "timer";
})(ActionTier || (exports.ActionTier = ActionTier = {}));
