exports.config =
  # See http://brunch.readthedocs.org/en/latest/config.html for documentation.
  files:
    javascripts:
      joinTo:
        '../static/app.js': /^app/
        '../static/vendor.js': /^vendor/
      order:
        # Files in `vendor` directories are compiled before other files
        # even if they aren't specified in order.before.
        before: [
          'vendor/scripts/console-helper.js',
          'vendor/scripts/jquery-1.8.2.js',
          'vendor/scripts/underscore-1.4.0.js',
          'vendor/scripts/backbone-0.9.2.js',
          'vendor/scripts/jquery.cookie.js'
        ]

    stylesheets:
      joinTo:
        '../static/css/app.css': /^(app|vendor)/
      order:
        before: ['vendor/styles/normalize-1.0.1.css']
        after: ['vendor/styles/helpers.css']

    templates:
      joinTo: '../static/app.js'
