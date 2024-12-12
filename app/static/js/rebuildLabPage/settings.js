import { convertISOToCustomFormat } from '../utility/convertToIso.js';


const convertDateColumn = (data, type) => {
  if ('display' === type) {
    return data ? convertISOToCustomFormat(data, false, true, false, true) : 'Не проводилось';
  };
  return data
}


export const columnSettings = {
  main: {
    columns: {
      batchNumber : { 
        width: '15%',
        title: 'Номер Партии',
        data: 'batchNumber',
        className: 'details-control text-center',
      },
      createdAt: {
        width: '28%',
        title: 'Дата поступления',
        data: 'createdAt',
        className: 'text-center',
        render: convertDateColumn
      },
      laboratoryTestDate: {
        width: '28%',
        title: 'Последняя дата тестирования',
        data: 'laboratoryTestDate',
        className: 'text-center',
        render: convertDateColumn
      },
      laboratoryPassed: { 
        title: 'Статус',
        data: 'laboratoryPassed', 
        className: 'text-center',
        render: function(data, type, row) {
          if (type === 'display') {
            return data 
              ? 'Пройдено' 
              : 'Не пройдено';
          }
          return data;
        },
      },
    },
  },
  testWheels: {
    columns: {
      wheelId: {
        width: '15%',
        title: 'Номер маркировки',
        data: 'wheelId',
        className: 'text-center',
      },
      arrivalDate: {
        width: '30%',
        title: 'Дата поступления в ОКК',
        data: 'arrivalDate',
        className: 'text-center',
        render: convertDateColumn
      },
      testDate: {
        width: '30%',
        title: 'Дата тестирования',
        data: 'testDate',
        className: 'text-center',
        render: convertDateColumn
      },
      result: {
        width: '15%',
        title: 'Результат',
        data: 'result',
        className: 'text-center',
      },
    },
  },
  allWheels: {
    columns: {
      wheelId: {
        width: '15%',
        title: 'Номер маркировки',
        data: 'wheelId',
        className: 'text-center',
      },
      receiptDate: {
        width: '30%',
        title: 'Дата поступления',
        data: 'receiptDate',
        className: 'text-center',
        render: convertDateColumn,
      },
      status: {
        width: '55%',
        title: 'Информация о расположении',
        data: 'status',
        className: 'text-center',
      },
    },
  }
}
