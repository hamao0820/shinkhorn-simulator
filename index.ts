const main = () => {
  console.log("Hello World");
  const $inputFile = mustQuerySelector<HTMLInputElement>("#input-file");
  const $buttonRead = mustQuerySelector<HTMLButtonElement>("#button-read");

  $buttonRead.addEventListener("click", async (e) => {
    const files = $inputFile.files;
    if (!files) {
      return;
    }
    if (files.length === 0) {
      return;
    }
    const csv = await fetchFile(files[0]);
    const data = parseCSV(csv);
    console.log(data);
  });
};

const mustQuerySelector = <T extends HTMLElement>(selector: string): T => {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }
  return element as T;
};

const parseCSV = (csv: string): string[][] => {
  return csv
    .trim()
    .split("\n")
    .map((line) => line.split(",").map((value) => value.trim()));
};

const fetchFile = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target) {
        return;
      }
      const result = e.target.result;
      if (typeof result !== "string") {
        return;
      }
      resolve(result);
    };
    reader.readAsText(file);
  });
};

main();
