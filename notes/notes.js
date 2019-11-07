function Note(parentId) {
    this.Title="";
    this.Description="";
    this.Completed=false;
    this.ParentId=parentId;
    this.Id=vm.MaxId+1;
}

let DefaultNote = {Id: 0, Title: "NestPad", Description:"Everything here is editable, and will save automatically! Have fun!", Completed: false};
var model = {
    CurrentNote: DefaultNote,
    NoteList: [DefaultNote, {Id:1, ParentId: 0, Title: "Bullet Point"}],
    MaxId: 0
}

if (!localStorage.model)
    localStorage.model = JSON.stringify(model);
else model = JSON.parse(localStorage.model);

var vm = new Vue({
    el: "#list",
    data: {CurrentNote: model.CurrentNote, NoteList: model.NoteList},
    computed: {
        ChildNotes: function() { return this.GetChildren(this.CurrentNote);},
        Navigation: function(){
            let array = [];
            let note = this.CurrentNote;
            array.push(note);
            while (note.Id != 0) {
                note = this.GetParent(note);
                array.push(note);
            }
            return array.reverse();
        },
        MaxId: function(){return this.NoteList.sort(function(a,b){return a.Id-a.Id})[this.NoteList.length-1].Id;}
    },
    watch: {
        CurrentNote: ()=>{
            vm.Save();
            AutoGrow();
            document.title = "NestPad - " + vm.CurrentNote.Title;
        },
        NoteList: ()=>{vm.Save()}
    },
    methods: {
        GetParent: function(note){return this.NoteList.filter(function(n){return n.Id==note.ParentId})[0];},
        GetChildren: function(note){return this.NoteList.filter(function(n){return n.ParentId==note.Id});},
        Back: function () {if (this.CurrentNote.Id != 0)this.SetCurrentNote(this.GetParent(this.CurrentNote));},
        AddNote: function(){this.NoteList.push(new Note(this.CurrentNote.Id));},
        SetCurrentNote: function(note){this.CurrentNote=note},
        Save: function() {
            localStorage.model = JSON.stringify({
                CurrentNote: this.CurrentNote,
                NoteList: this.NoteList,
                MaxId: this.MaxId
            });
        },
        DeleteNote: function (note) {
            let children = this.GetChildren(note);
            children.forEach(child => this.DeleteNote(child));
            this.NoteList.splice(this.NoteList.indexOf(note),1);
        },
        Export: function () {
            var pom = document.createElement('a');
            pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(localStorage.model));
            pom.setAttribute('download', 'notes.json');
            pom.click();
        },
        Import: function() {
            let self=this;
            document.getElementById("FileImport").click();
            document.getElementById("FileImport").onchange = function() {
                let reader = new FileReader();
                reader.onload = function( ev ) {
                    var contents = JSON.parse( decodeURIComponent( ev.target.result ) );
                    self.CurrentNote=contents.CurrentNote;
                    self.MaxId=contents.MaxId;
                    self.NoteList=contents.NoteList;
                 };
                var file = this.files[0];
                reader.readAsText(file);    
            }
        },
        ToggleCompleted: function(note) {
            note.Completed=!note.Completed;
            vm.Save();
        },
        EnterPressed: function(note){
            if (this.ChildNotes.indexOf(note)==this.ChildNotes.length-1) this.AddNote();
            setTimeout(function(){
                document.getElementById(vm.ChildNotes[vm.ChildNotes.indexOf(note)+1].Id).focus();
            },1);
        },
        UpPressed: function(note){
            if (this.ChildNotes.indexOf(note)>0)
                document.getElementById(vm.ChildNotes[vm.ChildNotes.indexOf(note)-1].Id).focus();
        },
        DownPressed: function(note){
            if (this.ChildNotes.indexOf(note)<this.ChildNotes.length-1)
            document.getElementById(vm.ChildNotes[vm.ChildNotes.indexOf(note)+1].Id).focus();
        }
    }    
});

function AutoGrow() {
    setTimeout(() =>{
        let element=document.getElementById("description");
        if (element){
            element.style.height = "5px";
            element.style.height = (element.scrollHeight)+"px";
        }
    },1);
}

document.title = "NestPad - " + vm.CurrentNote.Title;
AutoGrow();