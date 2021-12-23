import {fas} from '@fortawesome/free-solid-svg-icons';
import fs from 'fs';
const file = fs.createWriteStream('FontAwesomeDef.js');
file.write("import ol_style_FontSymbol from './FontSymbol'\n");
file.write("ol_style_FontSymbol.addDefs(\n");
file.write('{ "font":"FontAwesome",\n');
file.write('\t"name":"FontAwesome",\n');
file.write('\t"copyright":"SIL OFL 1.1",\n');
file.write('\t"prefix": "fas"\n');
file.write('},\n');
file.write('{\n');
for (const [key, value] of Object.entries(fas)) {
  let iconName = 'fa-'+value.iconName;
  let iconCode = '\\u'+value.icon[3];
 file.write('\t"'+iconName+'":"'+iconCode+'",\n');
}
file.write('});\n');
file.end('export default ol_style_FontSymbol\n');
