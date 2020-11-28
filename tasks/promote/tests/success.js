"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tmrm = require("azure-pipelines-task-lib/mock-run");
const path = require("path");
let taskPath = path.join(__dirname, '..', 'index.js');
let tmr = new tmrm.TaskMockRunner(taskPath);
tmr.setInput('samplestring', 'human');
tmr.run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VjY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN1Y2Nlc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwwREFBMkQ7QUFDM0QsNkJBQThCO0FBRTlCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUN0RCxJQUFJLEdBQUcsR0FBd0IsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRWpFLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBRXRDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyJ9