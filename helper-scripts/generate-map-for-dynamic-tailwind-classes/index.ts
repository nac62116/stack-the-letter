import { program } from "commander";
import { z } from "zod";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

program.requiredOption(
  "-f, --fileName <fileName>",
  "The file name for the file that will be created in ./output. Allowed characters are a-z, A-Z, 0-9, - and _."
);

program.requiredOption(
  "-t, --templateString <templateString>",
  "The tailwind class you want to generate a map for. '<>' used as placeholders. Please also use quotes as needed and wrap the option inside single quotes. f.e. '\"w-[<range>px]\"' or '--grid-template-columns-<range>: repeat(<range>, minmax(0, 1fr))'"
);

program.requiredOption(
  "-r, --range <range>",
  "The range until the templateString should be generated. Maximum is 10000."
);

program.option(
  "-s, --start <start>",
  "Optional start from which the templateString should be genrated. Defaults to 0. f.e. 13-<range>",
  "0"
);

program.requiredOption(
  "-w, --wrapperType <wrapperType>",
  "The wrapper in which the templateString will be put comma seperated. Can be one of array or object."
);

program.parse(process.argv);

const options = program.opts();

const optionsSchema = z.object({
  fileName: z.string().regex(/^[a-zA-Z0-9_-]+$/),
  templateString: z.string(),
  range: z
    .string()
    .max(10000)
    .transform((range) => {
      return Number(range);
    })
    .refine((range) => {
      return isFinite(range);
    }),
  start: z
    .string()
    .transform((range) => {
      return Number(range);
    })
    .refine((range) => {
      return isFinite(range);
    }),
  wrapperType: z.enum(["array", "object"]),
});

async function main() {
  const typedOptions = optionsSchema.parse(options);
  const { fileName, templateString, range, start, wrapperType } = typedOptions;

  let index = start;
  let baseJsonString = '{"output": <jsonString>}';
  let templateJsonString = "";
  for (index; index <= range; index++) {
    const replacedTemplate = templateString.replaceAll(
      "<range>",
      index.toString()
    );
    templateJsonString =
      index !== range
        ? `${templateJsonString}${replacedTemplate},`
        : `${templateJsonString}${replacedTemplate}`;
  }
  const outputJsonString = baseJsonString.replace(
    "<jsonString>",
    wrapperType === "array"
      ? `[${templateJsonString}]`
      : `{${templateJsonString}}`
  );
  const output = await JSON.parse(outputJsonString);
  await fs.writeJSON(
    path.resolve(__dirname, `./output/${fileName}.json`),
    output,
    {
      encoding: "utf-8",
      spaces: 2,
    }
  );
}

main()
  .catch((error) => {
    throw error;
  })
  .finally(async () => {
    console.log(
      `${options.fileName} created inside ./output. In this file you find all tailwind classes explicitly mapped for your range.`
    );
  });
