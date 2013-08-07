/**
 * Created by geNAZt on 06.08.13.
 */
module.exports = function(http$app) {
    http$app.get("/", function(req, res) {
        res.render("index");
    });
}