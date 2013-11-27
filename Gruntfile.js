/*jshint camelcase:false,node:true*/
module.exports = function (grunt) {

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	// Project configuration.
	grunt.initConfig({
		// Task configuration.
		config: {
			root: './',
			cssDir: '<%= config.root %>/css/',
			jsDir: '<%= config.root %>/js/',
			imgDir: '<%= config.root %>/img/',
		},
		watch: {
			content: {
				files: [
					'<%= config.root %>/_drafts/**/*',
					'<%= config.root %>/_posts/**/*',
					'<%= config.root %>/_layouts/**/*',
					'<%= config.root %>/_includes/**/*',
					'<%= config.root %>/styl/**/*',
					'<%= config.root %>/js/**/*',
					'<%= config.root %>/*.md',
					'<%= config.root %>/*.html',
				],
				tasks: ['content']
			}
		},
		stylus: {
			assets: {
				files: {
					'<%=config.root %>/css/main.css': '<%= config.root %>/styl/main.styl',
					'<%=config.root %>/css/resume.css': '<%= config.root %>/styl/resume.styl'
				}
			}
		},
		connect: {
			server: {
				options: {
					hostname: '*',
					port: 4000,
					base: '<%=config.root %>/_site'
				}
			}
		},
		shell: {
			jekyllDev: {
				command: 'jekyll build --drafts',
				options: {
					stdout: true,
					stderr: true,
					execOptions: {
						cwd: '<%= config.root %>'
					}
				}
			},
			jekyll: {
				command: 'jekyll build',
				options: {
					stdout: true,
					stderr: true,
					execOptions: {
						cwd: '<%= config.root %>'
					}
				}
			},
			pygments: {
				command: 'pygmentize -S default -f html > pygments.css',
				options: {
					stdout: true,
					execOptions: {
						cwd: 'css'
					}
				}
			},
			deploy: {
				command: 'rsync --compress --recursive --checksum --delete _site/ nicknisi@nicknisi.com:/var/www/nicknisi.com/public_html',
				options: {
					stdout: true,
					stderr: true,
					execOptions: {
						cwd: '.'
					}
				}
			}
		}
	});

	// Default task.
	grunt.registerTask('default', ['watch']);
	grunt.registerTask('content', ['stylus:assets', 'shell:jekyllDev']);
	grunt.registerTask('contentprod', ['stylus:assets', 'shell:jekyll']);
	grunt.registerTask('deploy', ['contentprod', 'shell:deploy']);
	grunt.registerTask('dev', ['connect:server', 'watch']);

};
