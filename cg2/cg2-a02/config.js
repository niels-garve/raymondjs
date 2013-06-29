/**
 * @author Niels Garve, niels.garve.yahoo.de
 */
define(function () {
    var config = {
        'MESH_SAMPLER_WIDTH': 256, // mehr Vertizes können nicht adressiert werden
        'MESH_SAMPLER_HEIGHT': 4 // mind. 3 (eine Reihe Indizes, eine Vertizes, eine Normalen), aber Vielfaches von 2
    };

    var Config = function () {
    };

    Config.prototype.get = function (name) {
        return config[name];
    };

    return Config;
});