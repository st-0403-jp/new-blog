const fs = require('fs');
const cpx = require('cpx');
const ejs = require('ejs');
const glob = require("glob");
const { argv: commands } = process;

const optionsMap = new Map();

if (commands.length > 2) {
    const options = commands.filter((o, i) => i > 1);
    options.forEach(option => {
        const keyval = option.split('=');
        const key = keyval[0];
        const val = keyval[1];
        optionsMap.set(key, val);
    });
}

const DEVELOP_ENV = optionsMap.get('env');

if (DEVELOP_ENV !== 'local' && DEVELOP_ENV !== 'prod') throw new Error('NOT FOUND: DEVELOP_ENV');

const SRC_PATH = {
    view: {
        all: 'src/view/**/*.ejs',
        all_ignore: 'src/view/**/_*.ejs',
        home: 'src/view/home/index.ejs',
    },
};

const DEST_DIR = DEVELOP_ENV === 'prod' ? 'dist' : 'build';

const convertView = (file) => {
    ejs.renderFile(file, {}, {}, (err, html) => {
        if (err) throw new Error('ERROR RENDER: ejs');
        fs.writeFile('index.html', html, err => {
            if (err) throw new Error('ERROR RENDER: writeFile for convertView');
            cpx.copy('index.html', DEST_DIR, {clean: true}, () => {
                fs.unlinkSync('index.html');
            });
        });
    });
};

const compile = () => {
    const { view } = SRC_PATH;

    // clean
    glob(`${DEST_DIR}/**/*.*`, {}, (err, files) => {
        if (err) throw new Error('ERROR COMPILE: clean');
        files.forEach(file => {
            fs.unlinkSync(file);
        });
    });

    // view
    glob(view.all, {ignore: view.all_ignore}, (err, files) => {
        if (err) throw new Error('ERROR COMPILE: file not found');
        files.forEach(file => {
            convertView(file);
        });
    });
};
compile();
