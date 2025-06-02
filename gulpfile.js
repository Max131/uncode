import gulp from "gulp";
// import babel from "gulp-babel";
import plumber from "gulp-plumber";

import pug from "gulp-pug";

import postcss from "gulp-postcss";
import stylelint from "gulp-stylelint-esm";
import prettier from "gulp-prettier";
import purgecss from "gulp-purgecss";
import purgeCssFromPug from "purgecss-from-pug";

import { deleteSync } from "del";

import { init as server, reload, stream } from "browser-sync";

const PATHS = {
  html: {
    src: "src/pages/**/*.pug",
    dest: "public"
  },
  templates: {
    src: "src/templates/**/*.pug"
  },
  css: {
    src: "src/css/style.css",
    dest: "public"
  },
  js: {
    src: "src/js/**/*.js",
    dest: "public/js"
  },
  fonts: {
    src: "src/fonts/**/*",
    dest: "public/fonts"
  },
  images: {
    src: "src/images/**/*",
    dest: "public/images"
  },
  videos: {
    src: "src/videos/**/*",
    dest: "public/videos"
  }
};

export const html = () => {
  return gulp
    .src([PATHS.html.src])
    .pipe(plumber())
    .pipe(pug())
    .pipe(prettier())
    .pipe(gulp.dest(PATHS.html.dest))
    .pipe(reload({ stream: true }));
};

export const css = () => {
  return gulp
    .src([PATHS.css.src])
    .pipe(plumber())
    .pipe(postcss())
    .pipe(
      stylelint({
        reporters: [
          {
            formatter: "string",
            console: true
          }
        ],
        fix: true,
        failAfterError: false
      })
    )
    .pipe(prettier())
    .pipe(gulp.dest(PATHS.css.dest))
    .pipe(reload({ stream: true }));
};

export const js = () => {
  return (
    gulp
      .src([PATHS.js.src])
      .pipe(plumber())
      // .pipe(babel({ presets: ["@babel/preset-env"] }))
      .pipe(gulp.dest(PATHS.js.dest))
      .pipe(reload({ stream: true }))
  );
};

export const fonts = () => {
  return gulp
    .src([PATHS.fonts.src], { encoding: false })
    .pipe(plumber())
    .pipe(gulp.dest(PATHS.fonts.dest))
    .pipe(stream());
};

export const images = () => {
  return gulp
    .src([PATHS.images.src], { encoding: false })
    .pipe(plumber())
    .pipe(gulp.dest(PATHS.images.dest))
    .pipe(stream());
};

export const videos = () => {
  return gulp
    .src([PATHS.videos.src], { encoding: false })
    .pipe(plumber())
    .pipe(gulp.dest(PATHS.videos.dest))
    .pipe(stream());
};

export const purge = () => {
  return gulp
    .src([PATHS.css.src])
    .pipe(plumber())
    .pipe(postcss())
    .pipe(
      stylelint({
        reporters: [
          {
            formatter: "string",
            console: true
          }
        ],
        fix: true
      })
    )
    .pipe(prettier())
    .pipe(gulp.dest(PATHS.css.dest))
    .pipe(
      purgecss({
        content: [PATHS.templates.src, PATHS.pages.src],
        variables: true,
        safelist: ["carousel-dot"],
        extractors: [
          {
            extractor: purgeCssFromPug,
            extensions: ["pug"]
          }
        ]
      })
    )
    .pipe(gulp.dest("public"));
};

export const clean = (done) => {
  const deletedFiles = deleteSync(["./public/**"]);

  console.log(`Files deleted: \n${deletedFiles.join("\n")}`);
  done();
};

export const build = gulp.series(clean, fonts, html, js, images, purge);

export const watch = () => {
  // gulp.watch(["src/templates/**/*.pug", "src/pages/**/*.pug"], gulp.series("html"));
  gulp.watch([PATHS.html.src, PATHS.templates.src], gulp.series("html"));
  gulp.watch("src/css/**/*.css", gulp.series("css"));
  gulp.watch("src/js/**/*.js", gulp.series("js"));
  gulp.watch("src/images/**/*", gulp.series("images"));
  server({
    server: {
      baseDir: "./public/"
    },
    ghostMode: false,
    open: false,
    online: false
  });
};

export const dev = gulp.series(fonts, html, css, js, images, watch);
export default dev;
