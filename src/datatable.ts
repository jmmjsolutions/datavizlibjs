export type ColumnDataTypes = 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'timeofday';

type TimeOfDay = [number, number, number, number];

export class Column {
    id: string;
    label: string;
    type: ColumnDataTypes
    constructor(id: string, label: string, columnType: ColumnDataTypes) {
        this.id = id;
        this.label = label;
        this.type = columnType;
    }
}

export class Row {
    c: Array<Cell> = [];

    addCell(cell: Cell) {
        this.c.push(cell);
    }
}

export class Cell {
    /**
     * [Optional] The cell value. The data type should match the column data type. 
     * If the cell is null, the v property should be null, though it 
     * can still have f and p properties.
     */
    v?: any;
    /**
     * [Optional] A string version of the v value, formatted for display. 
     * Typically the values will match, though they do not need to, so if 
     * you specify Date(2008, 0, 1) for v, you should specify "January 1, 2008" 
     * or some such string for this property. This value is not checked against 
     * the v value. The visualization will not use this value for calculation, 
     * only as a label for display. If omitted, a string version of v will be 
     * automatically generated using the default formatter. 
     * The f values can be modified using your own formatter, or set with 
     * setFormattedValue() or setCell(), or retrieved with getFormattedValue().
     */
    f?: string;
    /**
     * [Optional] An object that is a map of custom values applied to the cell. 
     * These values can be of any JavaScript type. If your visualization supports 
     * any cell-level properties, it will describe them. These properties can be 
     * retrieved by the getProperty() and getProperties() methods. 
     * Example: p:{style: 'border: 1px solid green;'}
     */
    p?: {};

    constructor(v?: any, f?: string, p?: {}) {
        this.v = v || null;
        this.f = f || undefined;
        this.p = p || undefined;
    }
}

/**
 * The DataTable object is used to hold the data passed into a visualization. 
 * A DataTable is a basic two-dimensional table. All data in each column must 
 * have the same data type. Each column has a descriptor that includes its 
 * data type, a label for that column (which might be displayed by a visualization), 
 * and an ID, which can be used to refer to a specific column (as an alternative to 
 * using column indexes). The DataTable object also supports a map of arbitrary 
 * properties assigned to a specific value, a row, a column, or the whole DataTable.
 */
export class DataTable {
    cols: Array<Column> = [];
    rows: Array<Row> = [];

    /**
     * 
     * @param data [Optional] Data used to initialize the table. This can either be the 
     *  JSON returned by calling DataTable.toJSON() on a populated table, or a JavaScript 
     *  object containing data used to initialize the table. The structure of the JavaScript 
     * literal object is described here: https://developers.google.com/chart/interactive/docs/reference#dataparam 
     * @param version [Optional] A numeric value specifying the version of the wire protocol 
     *  used. This is only used by Chart Tools Datasource implementors. 
     *  The current version is 0.6.
     */
    constructor(data?: any, version?: number) {
        if (data !== undefined) {
            this.loadData(data);
        }
    }

    private loadData(data) {
        data.cols.forEach((entry) => {
            this.addColumn(entry.type, entry.label, entry.id)
        })
        data.rows.forEach((entry) => {
            this.addRow(entry.c)
        })
    }

    /**
     * Adds a new column to the data table, and returns the index of the new column. 
     * All the cells of the new column are assigned a null value.
     * 
     * @param type A string with the data type of the values of the column. 
     *  The type can be one of the following: 'string', 'number', 'boolean', 'date', 
     *  'datetime', and 'timeofday'.
     * @param label [Optional] A string with the label of the column. 
     *  The column label is typically displayed as part of the visualization, 
     *  for example as a column header in a table, or as a legend label in a pie chart. 
     *  If no value is specified, an empty string is assigned.
     * @param id [Optional] A string with a unique identifier for the column. 
     *  If no value is specified, an empty string is assigned.
     */
    addColumn(type: ColumnDataTypes, label?: string, id?: string): number {
        let colIndex = (this.cols.push(new Column(id || '', label || '', type))) - 1;
        if (this.rows.length > 0) {
            // add new column to existing rows
            this.rows.forEach((row) => {
                row.addCell(new Cell(null));
            })
        }
        return colIndex;
    }

    /**
     * Adds a new row to the data table, and returns the index of the new row.
     * 
     * @param cellArray [Optional] A row object, in JavaScript notation, specifying the 
     *  data for the new row. If this parameter is not included, this method will simply 
     *  add a new, empty row to the end of the table. This parameter is an array of cell 
     *  values: if you only want to specify a value for a cell, just give the cell 
     *  value (e.g. 55 or 'hello'); if you want to specify a formatted value and/or 
     *  properties for the cell, use a cell object (e.g., {v:55, f:'Fifty-five'}). 
     *  You can mix simple values and cell objects in the same method call). 
     *  Use null or an empty array entry for an empty cell.
     */
    addRow(cellArray?): number {
        let row = new Row();
        let cell = new Cell();
        if (cellArray === undefined) {
            cellArray = [];
            for (let i = 0; i < this.cols.length; i++) {
                cellArray.push(new Cell(null));
            }
        }
        cellArray.forEach((entry) => {
            if (entry instanceof Cell || entry instanceof Object) {
                cell = entry;
            } else {
                cell = new Cell();
                cell.v = entry;
            }
            row.addCell(cell);
        })
        return this.rows.push(row) - 1;
    }

    /**
     * Adds new rows to the data table, and returns the index of the last added row. 
     * You can call this method to create new empty rows, or with data used to 
     * populate the rows, as described below.
     * @param numOrArray Either a number or an array:
     *   * Number - A number specifying how many new, unpopulated rows to add.
     *   * Array - An array of row objects used to populate a set of new rows. 
     *      Each row is an object as described in addRow(). Use null or an empty 
     *      array entry for an empty cell.
     */
    addRows(numOrArray: number | Array<Row> | Array<any>): number {
        let index = 0;
        if (numOrArray instanceof Array) {
            numOrArray.forEach((entry) => {
                index = this.addRow(entry);
            })
        } else {
            for (let i = 0; i < numOrArray; i++) {
                index = this.addRow();
            }
        }
        return index;
    }

    /**
     * Check if column index is valid and in bounds for the datatable.
     * 
     * @param columnIndex integer greater than or equal to zero, and less 
     *  than the number of columns as returned by the getNumberOfColumns() method.
     */
    private validColumnIndex(columnIndex): void | never {
        if (columnIndex >= 0 && columnIndex < this.getNumberofColumns()) {
            return;
        } else {
            throw new Error(`Invalid column index ${columnIndex}. Should be an integer in range[0-${this.getNumberofColumns()-1}]`)
        }
    }

    /**
     * Check if row index is valid and in bounds for the datatable.
     * 
     * @param rowIndex integer greater than or equal to zero, and less 
     *  than the number of columns as returned by the getNumberOfColumns() method.
     */
    private validRowIndex(rowIndex): void | never {
        if (rowIndex >= 0 && rowIndex < this.getNumberofRows()) {
            return;
        } else {
            throw new Error(`Invalid row index ${rowIndex}. Should be an integer in range[0-${this.getNumberofRows()-1}]`)
        }
    }

    /**
     * Returns the number of columns in the table.
     */
    getNumberofColumns(): number {
        return this.cols.length;
    }

    /**
     * Returns the number of rows in the table.
     */
    getNumberofRows(): number {
        return this.rows.length;
    }

    /**
     * Returns the identifier of a given column specified by the column index in 
     * the underlying table.
     * For data tables that are retrieved by queries, the column identifier is set by 
     * the data source, and can be used to refer to columns when using the query language.
     * 
     * @param columnIndex columnIndex should be a number greater than or equal to zero, and less 
     *  than the number of columns as returned by the getNumberOfColumns() method.
     */
    getColumnId(columnIndex: number): string {
        this.validColumnIndex(columnIndex);
        return this.cols[columnIndex].id;
    }

    /**
     * Returns the label of a given column specified by the column index in the underlying table.
     * The column label is typically displayed as part of the visualization. For example the 
     * column label can be displayed as a column header in a table, or as the legend label in a 
     * pie chart.
     * For data tables that are retrieved by queries, the column label is set by the data source, 
     * or by the label clause of the query language.
     * 
     * @param columnIndex columnIndex should be a number greater than or equal to zero, and less 
     *  than the number of columns as returned by the getNumberOfColumns() method.
     */
    getColumnLabel(columnIndex: number): string {
        this.validColumnIndex(columnIndex);
        return this.cols[columnIndex].label;
    }

    /**
     * Returns the type of a given column specified by the column index.
     * 
     * @param columnIndex columnIndex should be a number greater than or equal to zero, and less 
     *  than the number of columns as returned by the getNumberOfColumns() method.
     * 
     * The returned column type can be one of the following: 
     * 'string', 'number', 'boolean', 'date', 'datetime', and 'timeofday'
     */
    getColumnType(columnIndex: number): string {
        this.validColumnIndex(columnIndex);
        return this.cols[columnIndex].type;
    }

    /**
     * Returns the value of the cell at the given row and column indexes.
     * 
     * @param rowIndex integer greater than or equal to zero, and less than the number of rows 
     *  as returned by the getNumberOfRows() method.

     * @param columnIndex integer greater than or equal to zero, and less than the number of
        columns as returned by the getNumberOfColumns() method.
     *
     * The type of the returned value depends on the column type (see getColumnType):
     *   * If the column type is 'string', the value is a string.
     *   * If the column type is 'number', the value is a number.
     *   * If the column type is 'boolean', the value is a boolean.
     *   * If the column type is 'date' or 'datetime', the value is a Date object.
     *   * If the column type is 'timeofday', the value is an array of four numbers: [hour, minute, second, milliseconds].
     *   * If the cell value is a null value, it returns null.
     */
    getValue(rowIndex: number, columnIndex: number): string | number | boolean | Date | TimeOfDay {
        this.validRowIndex(rowIndex);
        this.validColumnIndex(columnIndex);

        return this.rows[rowIndex].c[columnIndex].v;
    }

    /**
     * Sets the value of a cell. In addition to overwriting any existing cell value, 
     * this method will also clear out any formatted value and properties for the cell.
     * 
     * @param rowIndex number greater than or equal to zero, and less than the number of rows 
     *  as returned by the getNumberOfRows() method.
     * @param columnIndex number greater than or equal to zero, and less than the number of 
     *  columns as returned by the getNumberOfColumns() method. This method does not let you 
     *  set a formatted value for this cell; to do that, call setFormattedValue().
     * @param value the value assigned to the specified cell. The type of the returned value 
     *  depends on the column type. For any column type, the value can be set to null.
     */
    setValue(rowIndex: number, columnIndex: number, value: string | number | boolean | Date | TimeOfDay): void {
        this.validRowIndex(rowIndex);
        this.validColumnIndex(columnIndex);
        let typeMismatch = false;
        switch (this.cols[columnIndex].type) {
            case 'date':
                typeMismatch = (value instanceof Date ? false : true);
                break;
            case 'timeofday':
                typeMismatch = (value instanceof Array && value.length === 4 ? false : true);
                break;
            default:
                typeMismatch = (typeof (value) === this.cols[columnIndex].type ? false : true);
                break;
        }
        if (!typeMismatch) {
            this.rows[rowIndex].c[columnIndex].v = value;
        } else {
            throw new TypeError(
                `Type mismatch. Value ${value} does not match type ${this.cols[columnIndex].type} in column index ${columnIndex}`
            );
        }

    }
}