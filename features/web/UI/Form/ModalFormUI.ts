import {By, PageElement} from '@serenity-js/web';


let titleForm = "//*[contains(text(),'Thanks for submitting the form')]"
let studentName = "//td[contains(text(),'Student Name')]//following::td[1]"
let studentEmail = "//td[contains(text(),'Student Email')]//following::td[1]"
let gender = "//td[contains(text(),'Gender')]//following::td[1]"
let mobile = "//td[contains(text(),'Mobile')]//following::td[1]"
let dateOfBirth = "//td[contains(text(),'Date of Birth')]//following::td[1]"
let subjects = "//td[contains(text(),'Subjects')]//following::td[1]"
let hobbies = "//td[contains(text(),'Hobbies')]//following::td[1]"
let picture = "//td[contains(text(),'Picture')]//following::td[1]"
let address = "//td[contains(text(),'Address')]//following::td[1]"
let stateAndCity = "//td[contains(text(),'State and City')]//following::td[1]"




export class ModalFormUI {
     
    static TitleForm = () =>
        PageElement.located(By.xpath(titleForm)).describedAs('Titulo del formulario')
     
    static StudentName = () =>
        PageElement.located(By.xpath(studentName)).describedAs('Nombre del estudiante')

    static StudentEmail = () =>
        PageElement.located(By.xpath(studentEmail)).describedAs('Email del studiante')
    
    static Gender = () =>
        PageElement.located(By.xpath(gender)).describedAs('Genero del studiante')
    
    static Mobile = () =>
        PageElement.located(By.xpath(mobile)).describedAs('Telefono del studiante')
    
    static DateOfBirth = () =>
        PageElement.located(By.xpath(dateOfBirth)).describedAs('Cumpleaños del studiante')
    
    static Subjects = () =>
        PageElement.located(By.xpath(subjects)).describedAs('Areas de estudio del studiante')
    
    static Hobbies = () =>
        PageElement.located(By.xpath(hobbies)).describedAs('Pasatiempos del studiante')
    
    static Picture = () =>
        PageElement.located(By.xpath(picture)).describedAs('Foto del studiante')
    
    static Address = () =>
        PageElement.located(By.xpath(address)).describedAs('Direccion del studiante')
    
    static StateAndCity = () =>
        PageElement.located(By.xpath(stateAndCity)).describedAs('Stado y ciudad del studiante')
    
    

}