define(
    ["jquery"],
    (function ($) {
        "use strict";

        function webClInfo() {
            if (window.WebCL === undefined) {
                alert("Unfortunately your system does not support WebCL. " +
                    "Make sure that you have both the OpenCL driver " +
                    "and the WebCL browser extension installed.");
                return;
            }

            try {
                var platforms = WebCL.getPlatformIDs(), // API: Get the list of available platforms.
                    devices = [],
                    i;

                for (i = 0; i < platforms.length; i += 1) {
                    var platform = platforms[i];
                    devices[i] = platform.getDeviceIDs(WebCL.CL_DEVICE_TYPE_ALL); // API: Obtain the list of devices
                    // available on a platform.
                }

                console.log(devices);

            } catch (e) {
                alert("Unfortunately platform or device inquiry failed.");
            }
        }

        return {
            "webClInfo": webClInfo
        }
    })
);