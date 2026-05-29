import {By, PageElement} from '@serenity-js/web';


let formOption = "//h5[contains(text(),'Forms')]"; // //*[@class="category-cards"]//a[2]
let practiceForm = "//*[contains(text(),'Practice Form')]"; // //*[@id="item-0"]//*[contains(text(),'Practice Form')]
let practiceFormTitle = "//h1[contains(text(),'Practice Form')]" // //*[@id="Ad.Plus-970x250-1"]//following::div//h1[contains(text(),'Practice Form')]
let name = "//*[@id='firstName']";
let lastName = "//*[@id='lastName']";
let email = "//*[@id='userEmail']";
let genderMale = "//*[@id='gender-radio-1']";
let genderFemale = "//*[@id='gender-radio-2']";
let genderOther = "//*[@id='gender-radio-3']";
let mobileNumber = "//*[@id='userNumber']";
let dateOfBirth = "//*[@id='dateOfBirthInput']";
let subjects = "//*[@id='subjectsInput']";
let checkSports = "//*[@id='hobbies-checkbox-1']";
let checkReading = "//*[@id='hobbies-checkbox-2']";
let checkMusic = "//*[@id='hobbies-checkbox-3']";
let uploadPicture = "//*[@id='uploadPicture']";
let address = "//*[@id='currentAddress']";
let state = "//*[@id='react-select-3-input']";
let stateOptions = (stateNumber:string)=>`//*[@id='react-select-3-option-${stateNumber}']`;
let city = "//*[@id='react-select-4-input']";
let cityOptions = (cityNumber:string)=>`//*[@id='react-select-4-option-${cityNumber}']`;
let submit = "//*[@id='submit']";




export class FormUI {
     
    static FormOption = () =>
        PageElement.located(By.xpath(formOption)).describedAs('Icono de formulario')
    
    static PracticeForm = () =>
        PageElement.located(By.xpath(practiceForm)).describedAs('Opcion de formulario en el lateral izquierdo')
    
    static PracticeFormTitle = () =>
        PageElement.located(By.xpath(practiceFormTitle)).describedAs('Titulo del formulario')
    
    static Name = () =>
        PageElement.located(By.xpath(name)).describedAs('Campo nombre')
    
    static LastName = () =>
        PageElement.located(By.xpath(lastName)).describedAs('Campo apellido')
    
    static Email = () =>
        PageElement.located(By.xpath(email)).describedAs('Campo email')
    
    static GenderMale = () =>
        PageElement.located(By.xpath(genderMale)).describedAs('Radio button para genero masculino')

    static GenderFemale = () =>
        PageElement.located(By.xpath(genderFemale)).describedAs('Radio button para genero femenino')

    static GenderOther = () =>
        PageElement.located(By.xpath(genderOther)).describedAs('Radio button para genero otro')

    static MobileNumber = () =>
        PageElement.located(By.xpath(mobileNumber)).describedAs('Campo de numero movil')

    static DateOfBirth = () =>
        PageElement.located(By.xpath(dateOfBirth)).describedAs('Campo de fecha de nacimiento')
    
    static Subjects = () =>
        PageElement.located(By.xpath(subjects)).describedAs('Campo de escritura')
    
    static CheckSports = () =>
        PageElement.located(By.xpath(checkSports)).describedAs('Checkbox para deportes')
    
    static CheckReading = () =>
        PageElement.located(By.xpath(checkReading)).describedAs('Checkbox para lectura')
    
    static CheckMusic = () =>
        PageElement.located(By.xpath(checkMusic)).describedAs('Checkbox para musica')
    
    static UploadPicture = () =>
        PageElement.located(By.xpath(uploadPicture)).describedAs('Input para cargar foto')
    
    static Address = () =>
        PageElement.located(By.xpath(address)).describedAs('Campo para direccion')
    
    static State = () =>
        PageElement.located(By.xpath(state)).describedAs('Select para estado')
    
    static StateOptions = (option:string) =>
        PageElement.located(By.xpath(stateOptions(option))).describedAs(`Opcion de stado ${option}`)
   
    static City = () =>
        PageElement.located(By.xpath(city)).describedAs('Select de ciudad')
    
    static CityOptions = (option:string) =>
        PageElement.located(By.xpath(cityOptions(option))).describedAs(`Opcion de ciudad ${option}`)
    
    static Submit = () =>
        PageElement.located(By.xpath(submit)).describedAs('Radio button para genero otro')

}