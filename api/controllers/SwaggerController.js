const SwaggerController = {
    $swagger: {
        ignore: true
    },

    doc(req, res) {
        res.status(200).jsonx(sails.hooks['swagger-pp'].doc)
    },

    ui (req, res) {
      let docUrl = req.protocol + '://' + req.get('Host') + '/swagger/doc'
      res.redirect(sails.config.swagger.ui.url + '?doc=' + encodeURIComponent(docUrl))
    }
}

export default SwaggerController
