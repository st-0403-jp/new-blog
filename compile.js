const fs = require('fs');
const path = require('path');
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
} else {
    throw new Error('NOT FOUND: undefinded command for env');
}

const DEVELOP_ENV = optionsMap.get('env');

if (DEVELOP_ENV !== 'local' && DEVELOP_ENV !== 'prod') throw new Error('NOT FOUND: DEVELOP_ENV');

const SRC_PATH = {
    view: {
        temp: {
            all: 'src/view/**/*.ejs',
            all_ignore: 'src/view/**/_*.ejs',
            home: 'src/view/home/index.ejs',
        },
        style: {
            all: 'src/view/**/style.css',
            all_ignore: 'src/view/**/_*.css',
        },
    },
};

const DEST_DIR = DEVELOP_ENV === 'prod' ? 'dist' : 'build';

const convertView = (file) => {
    const page = file.replace(/\/|src|view|index\.ejs/g, '');
    const html = ejs.render(fs.readFileSync(file, 'utf8'), {}, {
        root: path.resolve(__dirname, 'src'),
        filename: file,
    });
    return {
        page,
        html,
    };
};

const convertStyle = (file) => {
    const page = file.replace(/\/|src|view|style\.css/g, '');
    const css = fs.readFileSync(file, 'utf8');
    const style = css.replace(new RegExp('\\n', 'g'), '').replace(/  /g, '');
    return {
        page,
        style,
    }
};

const doConvert = async () => {
    const { view } = SRC_PATH;

    const { temp, style } = view;

    const htmlResource = await (() => {
        const htmls = [];
        const files = glob.sync(temp.all, {ignore: temp.all_ignore});
        files.forEach(file => {
            htmls.push(convertView(file));
        });
        return htmls;
    })();

    const cssResource = await (() => {
        const csses = [];
        const files = glob.sync(style.all, {ignore: style.all_ignore});
        files.forEach(file => {
            csses.push(convertStyle(file));
        });
        return csses;
    })();

    return {
        htmlResource,
        cssResource,
    };
};

const compile = (resources) => {
    const { htmlResource, cssResource } = resources;

    const results = htmlResource.map(htmlObj => {
        const { page, html } = htmlObj;

        const result = cssResource.filter(({ page: styleTarget }) => page === styleTarget).map(target => {
            const { style } = target;

            const temp = html.replace(/<!--style-->/g, `<style>${style}</style>`);

            return {
                page,
                temp,
            };
        });

        return result[0];
    });

    results.forEach(result => {
        const { page, temp } = result;

        fs.mkdir(`${DEST_DIR}/${page}`, err => {
            if (err) throw new Error('EXIST: mkdir');
            fs.writeFileSync(`${DEST_DIR}/${page}/index.html`, temp);
        });
    });
};

// コンパイル
doConvert().then(resources => {
    compile(resources);
});
