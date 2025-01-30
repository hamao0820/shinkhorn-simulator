class Matrix {
  private matrix: number[][];
  private readonly size: number;

  private constructor(data: number[][]) {
    this.matrix = data;
    this.size = data.length;
  }

  public static fromData(data: number[][]) {
    const size = data.length;
    for (const row of data) {
      if (row.length !== size) {
        throw new Error("Matrix is not square");
      }
    }
    return new Matrix(data);
  }

  public toHTML(): HTMLDivElement {
    const container = document.createElement("div");
    const sumRows = this.sumRows();
    const sumCols = this.sumCols();

    // 行和
    const row = document.createElement("div");
    row.classList.add("row");
    for (let i = 0; i < this.size; i++) {
      const cell = document.createElement("div");
      cell.classList.add("cell", "sum", "sum-col");
      cell.textContent = String(sumCols[i]);
      row.appendChild(cell);
    }

    // 空白マス
    const cell = document.createElement("div");
    cell.classList.add("cell");
    row.appendChild(cell);
    container.appendChild(row);

    // 行列
    for (let i = 0; i < this.size; i++) {
      const row = document.createElement("div");
      row.classList.add("row");
      for (let j = 0; j < this.size; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.textContent = String(this.matrix[i][j]);
        row.appendChild(cell);
      }

      // 列和
      const cell = document.createElement("div");
      cell.classList.add("cell", "sum", "sum-row");
      cell.textContent = String(sumRows[i]);
      row.appendChild(cell);
      container.appendChild(row);
    }

    return container;
  }

  public sumRows(): number[] {
    return this.matrix.map((row) => row.reduce((acc, value) => acc + value, 0));
  }

  public sumCols(): number[] {
    return this.matrix.reduce((acc, row) => {
      row.forEach((value, i) => (acc[i] += value));
      return acc;
    }, new Array(this.size).fill(0));
  }
}

export default Matrix;
