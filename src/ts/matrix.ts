class Matrix {
  private matrix: number[][];
  private readonly size: number;
  private rowScaled: boolean = false;
  private colScaled: boolean = false;

  private constructor(data: number[][]) {
    this.matrix = data.map((row) => row.slice());
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

  public toHTML(precision: number): HTMLDivElement {
    const container = document.createElement("div");
    const sumRows = this.sumRows();
    const sumCols = this.sumCols();

    // 列和
    const row = document.createElement("div");
    row.classList.add("row");
    for (let i = 0; i < this.size; i++) {
      const cell = document.createElement("div");
      cell.classList.add("cell", "sum");
      if (this.colScaled) {
        cell.classList.add("scaled");
      }
      cell.textContent = sumCols[i].toPrecision(precision);
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
        cell.textContent = this.matrix[i][j].toPrecision(precision);
        row.appendChild(cell);
      }

      // 行和
      const cell = document.createElement("div");
      cell.classList.add("cell", "sum");
      if (this.rowScaled) {
        cell.classList.add("scaled");
      }
      cell.textContent = sumRows[i].toPrecision(precision);
      row.appendChild(cell);
      container.appendChild(row);
    }

    return container;
  }

  /**
   * sumRows は行和を求める
   * @returns 各行の和が入った長さが size の配列
   */
  public sumRows(): number[] {
    return this.matrix.map((row) => row.reduce((acc, value) => acc + value, 0));
  }

  /**
   * sumCols は列和を求める
   * @returns 各列の和が入った長さが size の配列
   */
  public sumCols(): number[] {
    return this.matrix.reduce((acc, row) => {
      row.forEach((value, i) => (acc[i] += value));
      return acc;
    }, new Array(this.size).fill(0));
  }

  /**
   * rowScaling は行スケーリングを行う
   *
   * 各行の和が 1 になるように, 各行の値を行の和で割り, その値で上書きする
   */
  public rowScaling(): void {
    if (this.rowScaled) {
      return;
    }
    const sumRows = this.sumRows();
    for (let i = 0; i < this.size; i++) {
      const scaling = sumRows[i];
      for (let j = 0; j < this.size; j++) {
        this.matrix[i][j] /= scaling;
      }
    }
    this.rowScaled = true;
    this.colScaled = false;
  }

  /**
   * colScaling は列スケーリングを行う
   *
   * 各列の和が 1 になるように, 各列の値を列の和で割り, その値で上書きする
   */
  public colScaling(): void {
    if (this.colScaled) {
      return;
    }
    const sumCols = this.sumCols();
    for (let i = 0; i < this.size; i++) {
      const scaling = sumCols[i];
      for (let j = 0; j < this.size; j++) {
        this.matrix[j][i] /= scaling;
      }
    }
    this.rowScaled = false;
    this.colScaled = true;
  }

  /**
   * isScaled は全ての行和と列和が eps 未満の誤差で 1 になっているかを判定する
   * @param eps 許容する誤差
   * @returns 行和と列和が eps 未満の誤差で 1 になっているか
   */
  public isScaled(eps: number): boolean {
    const sumRows = this.sumRows();
    const sumCols = this.sumCols();
    for (let i = 0; i < this.size; i++) {
      if (Math.abs(sumRows[i] - 1) > eps) {
        return false;
      }
      if (Math.abs(sumCols[i] - 1) > eps) {
        return false;
      }
    }
    return true;
  }
}

export default Matrix;
