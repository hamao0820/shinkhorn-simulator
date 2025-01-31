const parseCSVAsNumber = (csv: string): number[][] => {
  return csv
    .trim()
    .split("\n")
    .map((line) => line.split(",").map((value) => value.trim()))
    .map((line) =>
      line.map((value) => {
        const number = Number(value);
        if (isNaN(number)) {
          throw new Error(`Invalid number: ${value}`);
        }
        return number;
      })
    );
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

export { parseCSVAsNumber, fetchFile };
