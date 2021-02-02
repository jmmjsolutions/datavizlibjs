import { DataTable, Row } from './datatable';

const data3x5
 = {
    cols: [{ id: 'A', label: 'NEW A', type: 'string' },
    { id: 'B', label: 'B-label', type: 'number' },
    { id: 'C', label: 'C-label', type: 'date' },
    { id: 'D', label: 'D-label', type: 'boolean' },
    { id: 'E', label: 'E-label', type: 'timeofday' }
    ],
    rows: [{
        c: [{ v: 'a' },
        { v: 1.0, f: 'One' },
        { v: new Date(2008, 1, 28, 0, 31, 26), f: '2/28/08 12:31 AM' },
        { v: true},
        { v: [1, 2, 3, 4]}
        ]
    },
    {
        c: [{ v: 'b' },
        { v: 2.0, f: 'Two' },
        { v: new Date(2008, 2, 30, 0, 31, 26), f: '3/30/08 12:31 AM' },
        { v: false},
        { v: [2, 3, 4, 5]}
        ]
    },
    {
        c: [{ v: 'c' },
        { v: 3.0, f: 'Three' },
        { v: new Date(2008, 3, 30, 0, 31, 26), f: '4/30/08 12:31 AM' },
        { v: true},
        { v: [1, 2, 3, 4]}
        ]
    }
    ]
};

describe('DataTable creation', () => {
    test('create new empty DataTable', () => {
        const dt = new DataTable();
        expect(dt.cols.length).toBe(0);
        expect(dt.rows.length).toBe(0);
    });

    test('create new DataTable from data', () => {
        const dt = new DataTable(data3x5);
        expect(dt.cols.length).toBe(5);
        expect(dt.rows.length).toBe(3);
        // Check the contents of each row object
        let row = dt.rows[0].c;
        expect(row.length).toBe(5);
        for (let i = 0; i < 3; i++) {
            expect(row[i] === data3x5.rows[0].c[i]);
        }
    });

    test('add column to an empty DataTable', () => {
        const dt = new DataTable();
        const index = dt.addColumn('string', 'S1', 's_1')
        expect(index).toBe(0);
        expect(dt.cols.length).toBe(1);
        expect(dt.rows.length).toBe(0);
    });

    test('add column to a DataTable with 3 rows & 5 cols', () => {
        const dt = new DataTable(data3x5);
        const index = dt.addColumn('string', 'F-label', 'F');
        expect(index).toBe(5);
        expect(dt.cols.length).toBe(6); // Now should have 6 cols
        expect(dt.rows.length).toBe(3);
        // New null column created for existing rows
        expect(dt.rows[0].c[5].v).toBe(null);
        expect(dt.rows[1].c[5].v).toBe(null);
        expect(dt.rows[2].c[5].v).toBe(null);
    });

    test('add an empty row to an empty DataTable', () => {
        const dt = new DataTable();
        dt.addColumn('string', 'A-label', 'A');
        dt.addColumn('string', 'B-label', 'B');
        const index = dt.addRow()
        expect(index).toBe(0);
        expect(dt.rows.length).toBe(1);
        expect(dt.rows[0].c[0].v).toBe(null);
        expect(dt.rows[0].c[1].v).toBe(null);
    });

    test('add a row with a string and a date value to an empty DataTable', () => {
        const dt = new DataTable();
        const index = dt.addRow(['Hermione', new Date(1999, 0, 1)])
        expect(index).toBe(0);
        expect(dt.rows.length).toBe(1);
    });

    test('add a row with two cells, the second with a formatted value to an empty DataTable', () => {
        const dt = new DataTable();
        const index = dt.addRow(['Hermione', {
            v: new Date(1999, 0, 1),
            f: 'January First, Nineteen ninety-nine'
        }
        ]);
        expect(index).toBe(0);
        expect(dt.rows.length).toBe(1);
    });

    test('add a row where second column is undefined to an empty DataTable', () => {
        const dt = new DataTable();
        const index = dt.addRow(['Col1Val', null, 'Col3Val']);
        expect(index).toBe(0);
        expect(dt.rows.length).toBe(1);
    });

    test('add 5 empty rows to an empty DataTable', () => {
        const dt = new DataTable();
        let index = dt.addRows(5);
        expect(index).toBe(4);
        expect(dt.rows.length).toBe(5);
    });

    test('add 3 rows to an empty DataTable', () => {
        const dt = new DataTable();
        dt.addColumn('string');
        dt.addColumn('string');
        let index = dt.addRows([['R1C1', 'R1C2'], ['R2C1', 'R2C2']]);
        expect(index).toBe(1);
        expect(dt.rows.length).toBe(2);
    });
});

describe('DataTable get', () => {
    test('get number of columns', () => {
        const dt = new DataTable(data3x5);
        expect(dt.getNumberofColumns()).toBe(5);
    });

    test('get number of rows', () => {
        const dt = new DataTable(data3x5);
        expect(dt.getNumberofRows()).toBe(3);
    });

    test('get column id of column with blank id', () => {
        const data = {
            cols: [{ id: 'A', label: 'NEW A', type: 'string' },
            { id: '', label: '', type: 'number' },
            { id: 'C', label: 'C-label', type: 'date' }
            ],
            rows: []
        };
        const dt = new DataTable(data);
        expect(dt.getColumnId(1)).toBe('');
    });

    test('get column id of column with non blank id', () => {
        const data = {
            cols: [{ id: 'A', label: 'NEW A', type: 'string' },
            { id: '', label: '', type: 'number' },
            { id: 'C', label: 'C-label', type: 'date' }
            ],
            rows: []
        };
        const dt = new DataTable(data);
        expect(dt.getColumnId(0)).toBe('A');
    });

    test('get column id of non existant column, should throw Error', () => {
        const dt = new DataTable(data3x5);
        expect.assertions(2);
        try {
            dt.getColumnId(100);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error).toHaveProperty('message', 'Invalid column index 100. Should be an integer in range[0-4]');
        }
    });

    test('get column label of column with blank label', () => {
        const data = {
            cols: [{ id: 'A', label: 'NEW A', type: 'string' },
            { id: '', label: '', type: 'number' },
            { id: 'C', label: 'C-label', type: 'date' }
            ],
            rows: []
        };
        const dt = new DataTable(data);
        expect(dt.getColumnLabel(1)).toBe('');
    });

    test('get column label of column with non blank label', () => {
        const data = {
            cols: [{ id: 'A', label: 'NEW A', type: 'string' },
            { id: '', label: '', type: 'number' },
            { id: 'C', label: 'C-label', type: 'date' }
            ],
            rows: []
        };
        const dt = new DataTable(data);
        expect(dt.getColumnLabel(0)).toBe('NEW A');
    });

    test('get column label of non existant column, should throw Error', () => {
        const dt = new DataTable(data3x5);
        expect.assertions(2);
        try {
            dt.getColumnLabel(100);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error).toHaveProperty('message', 'Invalid column index 100. Should be an integer in range[0-4]');
        }
    });

    test('get column type of a column', () => {
        const dt = new DataTable(data3x5);
        expect(dt.getColumnType(0)).toBe('string');
        expect(dt.getColumnType(1)).toBe('number');
        expect(dt.getColumnType(2)).toBe('date');
        expect(dt.getColumnType(3)).toBe('boolean');
        expect(dt.getColumnType(4)).toBe('timeofday');
    });

    test('get column type of non existant column, should throw Error', () => {
        const dt = new DataTable(data3x5);
        expect.assertions(2);
        try {
            dt.getColumnType(100);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error).toHaveProperty('message', 'Invalid column index 100. Should be an integer in range[0-4]');
        }
    });

    test('get values at row and column indexes', () => {
        const dt = new DataTable(data3x5);
        expect(dt.getValue(1,0)).toBe('b');
        expect(dt.getValue(1,1)).toBe(2.0);
        expect(dt.getValue(1,2)).toStrictEqual(new Date(2008, 2, 30, 0, 31, 26));
        expect(dt.getValue(1,3)).toBe(false);
        expect(dt.getValue(1,4)).toStrictEqual([2, 3, 4, 5]);
    });

    test('get values at invalid row and valid column indexes, should throw Error', () => {
        const dt = new DataTable(data3x5);
        expect.assertions(2);
        try {
            dt.getValue(100,0)
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error).toHaveProperty('message', 'Invalid row index 100. Should be an integer in range[0-2]');
        }
    });

    test('get values at valid row and invalid column indexes, should throw Error', () => {
        const dt = new DataTable(data3x5);
        expect.assertions(2);
        try {
            dt.getValue(0,100)
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error).toHaveProperty('message', 'Invalid column index 100. Should be an integer in range[0-4]');
        }
    });
});

describe('DataTable set', () => {
    test('set string value for a string row/column cell', () => {
        const dt = new DataTable(data3x5);
        dt.setValue(0, 0, 'AA');
        expect(dt.rows[0].c[0].v).toBe('AA');
    });

    test('set string value for a row/column cell that is not a string type', () => {
        const dt = new DataTable(data3x5);
        // See https://stackoverflow.com/questions/46042613/how-to-test-the-type-of-a-thrown-exception-in-jest/58103698#58103698
        expect.assertions(2);
        try {
            dt.setValue(0, 0, 3.0)
        } catch (error) {
            expect(error).toBeInstanceOf(TypeError);
            expect(error).toHaveProperty('message', 'Type mismatch. Value 3 does not match type string in column index 0');
        }
    });

    test('set number value for a number row/column cell', () => {
        const dt = new DataTable(data3x5);
        dt.setValue(0, 1, 42.0);
        expect(dt.rows[0].c[1].v).toBe(42.0);
    });

    test('set string value for a number row/column cell, should throw TypeError', () => {
        const dt = new DataTable(data3x5);
        expect.assertions(2);
        try {
            dt.setValue(0, 1, 'ZZ')
        } catch (error) {
            expect(error).toBeInstanceOf(TypeError);
            expect(error).toHaveProperty('message', 'Type mismatch. Value ZZ does not match type number in column index 1');
        }
    });

    test('set boolean value for a boolean row/column cell', () => {
        const dt = new DataTable(data3x5);
        dt.setValue(0, 3, false);
        expect(dt.rows[0].c[3].v).toBe(false);
    });

    test('set string value for a boolean row/column cell, should throw TypeError', () => {
        const dt = new DataTable(data3x5);
        expect.assertions(2);
        try {
            dt.setValue(0, 3, 'ZZ')
        } catch (error) {
            expect(error).toBeInstanceOf(TypeError);
            expect(error).toHaveProperty('message', 'Type mismatch. Value ZZ does not match type boolean in column index 3');
        }
    });

    test('set date value for a date row/column cell', () => {
        const dt = new DataTable(data3x5);
        dt.setValue(0, 2, new Date(2021, 1, 28, 0, 31, 26));
        expect(dt.rows[0].c[2].v).toStrictEqual(new Date(2021, 1, 28, 0, 31, 26));
    });

    test('set string value for a date row/column cell, should throw TypeError', () => {
        const dt = new DataTable(data3x5);
        expect.assertions(2);
        try {
            dt.setValue(0, 2, 'ZZ')
        } catch (error) {
            expect(error).toBeInstanceOf(TypeError);
            expect(error).toHaveProperty('message', 'Type mismatch. Value ZZ does not match type date in column index 2');
        }
    });

    test('set timeofday value for a timeofday row/column cell', () => {
        const dt = new DataTable(data3x5);
        dt.setValue(0, 4, [12,30,10,5]);
        expect(dt.rows[0].c[4].v).toStrictEqual([12,30,10,5]);
    });

    test('set string value for a timeofday row/column cell, should throw TypeError', () => {
        const dt = new DataTable(data3x5);
        expect.assertions(2);
        try {
            dt.setValue(0, 4, 'ZZ')
        } catch (error) {
            expect(error).toBeInstanceOf(TypeError);
            expect(error).toHaveProperty('message', 'Type mismatch. Value ZZ does not match type timeofday in column index 4');
        }
    });

    test('set string value for a row/column cell where row index > than number of rows-1, should throw Error', () => {
        const dt = new DataTable(data3x5);
        expect.assertions(2);
        try {
            dt.setValue(10, 1, 'ZZ')
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error).toHaveProperty('message', 'Invalid row index 10. Should be an integer in range[0-2]');
        }
    });

    test('set string value for a row/column cell where column index > than number of columns-1, should throw Error', () => {
        const dt = new DataTable(data3x5);
        expect.assertions(2);
        try {
            dt.setValue(0, 10, 'ZZ')
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error).toHaveProperty('message', 'Invalid column index 10. Should be an integer in range[0-4]');
        }
    });
});
