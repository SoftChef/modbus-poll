// import * as main from '../src';

// const { default: ModbusModulator } = main;
// console.log('main', main);
// jest.mock('../src/index', () => {
//   return jest.fn().mockImplementation(() => {
//     return {
//       connect: jest.fn().mockImplementation(() => {
//         console.log('Mock connect');
//       }),
//     };
//   });
// });

// describe('Test ModbusModulator class', () => {
//   beforeEach(() => {
//   });
//   afterEach(() => {
//     jest.resetAllMocks();
//   });
//   test('Test connect', () => {
//     const modbusModulator = new ModbusModulator();
//     modbusModulator.connect();
//     // console.log(modbusModulator);
//     // expect(1).toEqual(1);
//   });
// });