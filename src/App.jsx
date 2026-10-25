import WorkoutApp from './family/WorkoutApp';
import {adapter} from './family/adapter';
import {KSK_PROGRAMS} from './data/kskPrograms';
import './family/base.css';
import './family/workout.css';
export default function App(){return <WorkoutApp kind="snatch" adapter={adapter} programs={KSK_PROGRAMS}/>;}
