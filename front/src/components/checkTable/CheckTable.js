/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useTable, useExpanded } from "react-table";
import "./CheckTable.css";
import "../../css/Commons.css";

function SubRows({ row, rowProps, visibleColumns, data, loading }) {
  async function handleRadioClick(id) {
    data.forEach(opcion => {
      if (opcion.id === id)
        opcion.selected = true;
      else
        opcion.selected = false;
    });
  }

  if (loading) {
    return (
      <tr>
        <td />
        <td colSpan={visibleColumns.length -1}>
          Loading...
        </td>
      </tr>
    );
  }

  let rowIndex = 0;
  let cellExpandedInd = 0;
  return (
    <>
      {data.map((x, i) => {
        rowIndex++;
        return (
          <tr
            {...rowProps}
            key={`${rowProps.key}-expanded-${i}`}
            className={rowIndex % 2 !== 0 ? 'bg-color' : ''}
          >
            {row.cells.map((cell) => {

              cellExpandedInd = cellExpandedInd + 1;
              return (
                /* cell.column.id === 'peso' ?
                  cellExpandedInd == row.cells.length &&
                    <td
                      {...cell.getCellProps()}
                      rowSpan={data.length}
                    >
                      {cell.render('Cell', {
                        value: cell.value
                      })}
                    </td>
                : */
                  cell.column.id === 'expander' ?
                      x.selected ?
                      <td key={x.id}>
                        <input type="radio" id={x.id} value={x.id} name={cell.row.original.criterio} defaultChecked onClick={() => handleRadioClick(x.id)} onChange={()=>{}}/>
                      </td>
                      :
                      <td key={x.id}>
                        <input type="radio" id={x.id} value={x.id} name={cell.row.original.criterio} onClick={() => handleRadioClick(x.id)} onChange={()=>{}}/>
                      </td>
                      
                  :
                  <td
                  {...cell.getCellProps()}
                  className={cell.column.id !== 'criterio' ? 'align-right' : ''}
                  >
                    {cell.render(cell.column.SubCell ? 'SubCell' : 'Cell', {
                      value:
                        cell.column.accessor &&
                        cell.column.accessor(x, i),
                      row: { ...row, original: x }
                    })}
                  </td> 
                      
              );
            })}
          </tr>
        );
      })}
    </>
  );
}

function SubRowAsync({ row, rowProps, visibleColumns }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {

    const timer = setTimeout(() => {
      setLoading(false);
      const opciones = row.original.Opcion ? row.original.Opcion : row.original.OpcionCustom;
      setData(opciones);
    }, 500);

    return () => {
      clearTimeout(timer);
    };

  }, [row.original.opciones]);

  return (
    <SubRows
      row={row}
      rowProps={rowProps}
      visibleColumns={visibleColumns}
      data={data}
      loading={loading}
      className='bg-color'
    />
  );
}

function CheckTable({ columns, data, renderRowSubComponent }) {
  const customPrepareRow = (row) => {
    row.rowProps = row.original.props?? {}
    return row;
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    visibleColumns,
    state: { expanded }
  } = useTable({ columns, data }, useExpanded);

  return (
    <table {...getTableProps()} className="blue checkTable" >
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()} className="table-header">
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()} className={column.id === 'peso_limite' ? 'align-center' : ''}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>

      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          customPrepareRow(row)
          const rowProps = row.getRowProps();
          return (
            <React.Fragment key={rowProps.key}>
            <tr {...rowProps}{...row.rowProps}>
              {row.cells.map(cell => {
                return (
                  cell.column.id === 'criterio' ?
                  <td {...cell.getCellProps()} className="subtitle">{cell.render('Cell')}</td> :
                  <td {...cell.getCellProps()} className="align-right">{cell.render('Cell')}</td>
                );
              })}
            </tr>
            {row.isExpanded &&
              renderRowSubComponent({ row, rowProps, visibleColumns })}
            </React.Fragment>
          )
        })}
      </tbody>
    </table>
  );

}

export {
  CheckTable,
  SubRowAsync
};