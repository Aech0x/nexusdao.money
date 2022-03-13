import { useTable } from "react-table"

function Table({ columns, data }: { columns: any; data: any }) {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data
    })

  {
    /* eslint-disable react/jsx-key */
    /* the jsx key is provided in the .get*Props() spreads */
  }
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="drop-shadow-md overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50" {...getTableProps()}>
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs text-center font-medium uppercase text-gray-500 tracking-wider"
                        {...column.getHeaderProps()}
                      >
                        {column.render("Header")}
                      </th>
                    ))}
                  </tr>
                ))}
                <tr></tr>
              </thead>
              <tbody
                className="bg-white divide-y divide-gray-200"
                {...getTableBodyProps()}
              >
                {rows.map((row) => {
                  prepareRow(row)
                  return (
                    <tr className="text-center" {...row.getRowProps()}>
                      {row.cells.map((cell) => {
                        return (
                          <td
                            className="px-4 py-2 whitespace-nowrap text-sm font-medium"
                            {...cell.getCellProps()}
                          >
                            {cell.render("Cell")}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Table
