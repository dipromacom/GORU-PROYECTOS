import React from 'react';
import { useTable, useSortBy } from 'react-table';
import "./SortTable.css";

function SortTable({ columns, data, rowProps=()=>({}) }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data
    },
    useSortBy
  );

  return (
    <>
      <table {...getTableBodyProps()} className="sortTable">
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc ? '' : ' (asc.)'
                      : ''
                    }
                  </span>
                </th>
              ))
              }
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map( (row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps(rowProps(row))}>
                {row.cells.map(cell => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  )
                })}
              </tr>
            );
          })
          }
        </tbody>
      </table>
    </>
  );
}

export {
  SortTable,
};