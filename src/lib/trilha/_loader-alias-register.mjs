import { register } from "node:module";
import { pathToFileURL } from "node:url";
register("./_loader-alias.mjs", pathToFileURL(import.meta.filename));
