    const express = require("express");
    const router = express.Router();

    const {
    createEmergency,
    createDonor,
    getNearbyDonors,
    login,signup,getDonorByPhone

    } = require("../transpoter/transpoter");


    router.route("/emergency").post(createEmergency);

    router.route("/donor").post(createDonor);

    router.route("/nearby-donors").get(getNearbyDonors);
    router.route("/login").post(login)
    router.route("/signup").post(signup)
    router.route("/get-donor").post(getDonorByPhone)





    module.exports = router;