import DynamicForm from './components/DynamicForm';
import formJson from '../../public/formData.json';

export default function Home() {
  return (
    <div>
        
        <DynamicForm formData={formJson} />

    </div>
  );
}
