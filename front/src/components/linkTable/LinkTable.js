import React from "react";
import { useExpanded, useTable } from "react-table";
import "./LinkTable.css";

function SubRows({ row, rowProps, visibleColumns, data, loading }) {
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
            {row.cells.map(cell => {
              return (
                <td
                  {...cell.getCellProps()}
                  className={cell.column.id === 'editar' 
                                ? 'edit-button'
                                : cell.column.id !== 'criterio'
                                  ? 'align_right'
                                  : ''
                            }
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
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const opciones = row.original.Opcion ? row.original.Opcion : row.original.OpcionCustom;
      setData(opciones);
      setLoading(false);
    }, 500)

    return () => {
      clearTimeout(timer);
    }
  }, []);

  return (
    <SubRows 
      row={row}
      rowProps={rowProps}
      visibleColumns={visibleColumns}
      data={data}
      loading={loading}
    />
  );
}

function LinkTable ({ columns: userColumns, data, renderRowSubComponent }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    visibleColumns,
    state: { expanded }
  } = useTable(
    {
      columns: userColumns,
      data
    },
    useExpanded
  );

  return (
    <>
    <table {...getTableProps()} className="linkTable">
      <thead>
      {
        headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()} className="table-header">
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
      {rows.map((row, i) => {
        prepareRow(row);
        const rowProps = row.getRowProps();
        return (
          <React.Fragment key={rowProps.key}>
            <tr {...rowProps}>
              {row.cells.map(cell => {
                return (
                  <td {...cell.getCellProps()} className={cell.column.id === 'editar' 
                                                          ? 'edit-button' 
                                                          : cell.column.id === 'criterio'
                                                            ? 'subtitle'
                                                            : 'subtitle align_right' }>{cell.render('Cell')}</td>
                );
              })}
            </tr>
            {row.isExpanded &&
              renderRowSubComponent({ row, rowProps, visibleColumns })}
          </React.Fragment>
        );
        
      })}
      </tbody>
    </table>
    </>
  );
}

export {
  LinkTable,
  SubRowAsync,
};
