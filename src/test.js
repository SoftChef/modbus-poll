class Queue {
  constructor() {
    this.tasks = [];
  }
  async add(task) {
    let process = false;
    if (this.tasks.length === 0) {
      process = true
    }
    this.tasks.push(task)
    if (process) {
      return this.process();
    }
  }
  async process() {
    const task = this.tasks.shift();
    if (task) {
      return task();
      // return result;
    }
  }
}

const t1 = () => {
  
}

let i = 0;

const sleep = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('i', i * i)
      resolve(i * i);
    }, 3000)
  });
}

const queue = new Queue();

setInterval(() => {
  i++;
  console.log('add by 500', i)
  const res = queue.add(async() => {
    return sleep();
  });
  console.log('res', res);
}, 500);

setInterval(() => {
  i++;
  console.log('add by 1500', i)
  const res = queue.add(async() => {
    return sleep();
  });
  console.log('res', res);
}, 1500);