'use strict';

module.exports = function(grunt) {

    var async  = require('async'),
        fs     = require('fs'),
        os     = require('os'),
        util   = require('util'),
        _      = require('lodash');

    grunt.registerMultiTask("tinyblog", "Runs tinyblog plugin to build a simple blog using templates out of a list of html body files", function() {
        var done    = this.async(),
            options = this.options({
                template: '',
                index_template: '',
                data:null
            }),
            files = this.files;

        var template = grunt.file.read(options.template);
        var index = grunt.file.read(options.index_template);
        var cnt = options.data.length-1

        async.each(files, function(file, next) {
            var sources, destination;

            destination = file.dest;

            sources = file.src.filter(function(path) {
                if (!fs.existsSync(path)) {
                    grunt.log.warn(util.format('Source file "%s" is not found', path));
                    return false;
                }

                return true;
            });

            


            async.map(sources, fs.readFile, function(err, contents) {
                if (err) {
                    grunt.log.error(util.format('Could not read files "%s"', sources.join(', ')));
                    return next(err);
                }

                options.data[cnt].body = contents.join(os.EOL)
                var ob = {data: options.data[cnt]}
                var newfile = grunt.template.process(template, ob);
                cnt--

                grunt.file.write(destination, newfile);
                grunt.verbose.writeln(util.format('Successfully rendered templa to "%s"', destination));
                next();
            });

        }, function() {
            
            grunt.log.ok(files.length + ' ' + grunt.util.pluralize(files.length, 'file/files') + ' created.');

            var newindex = grunt.template.process(index, {data: {list:options.data}});
            grunt.file.write(options.index_template, newindex);

          done();
        });

        

    });

};
