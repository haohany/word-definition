module.exports = function(grunt) {

	grunt.initConfig({

		clean: {
			css: ['*.css'],
		},

		sass: {
			options: {
				style: 'expanded',
				sourcemap: 'none'
			},
			multiple: {
				expand: true,
				flatten: true,
				src: '*.scss',
				dest: '',
				ext: '.css'
			}
		},

		jshint: {
			all: '*.js',
			options: {
				ignores: ['jquery.js'],
				curly: true,
				eqnull: true,
				eqeqeq: true,
				browser: true
			}
		},

		watch: {
			sass: {
				files: ['*.scss'],
				tasks: ['clean:css', 'sass']
			},
			js: {
				files: ['*.js'],
				tasks: ['jshint']
			}
		}
		
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['watch']);
	grunt.registerTask('all', ['clean', 'sass', 'jshint']);

};