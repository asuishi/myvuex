export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'umd'
  },
  name: 'Vuex',
  watch: {
    include: 'src/**'
  }
};