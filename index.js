let marginTop = 15, marginBottom = 5;
let marginLeft = 25, marginRight = 5;

let app = new Vue({
  el: '#app',
  data: {
    mapel: [],
    tabel: [],
    jumlahSemester: 0,
    averages: [],
    colors: ["#1ab19c", "#d58317", "#f223b8", "#9e4edd", "#1ad4a2", "#4b7e8e"],
    currentColor: "",
    dataEkspor: ""
  },
  methods: {
    tambahMapel: function(){
      this.mapel.push({
        nama: "",
        gambarSendiri: false,
        warna: ""
      });
      this.tambahBaris();
    },
    hapusMapel: function(index){
      this.hapusBaris(index);
      this.mapel.splice(index, 1);
    },
    tambahSemester: function(){
      this.tambahKolom();
      this.jumlahSemester++;
    },
    hapusSemester: function(){
      this.hapusKolom(-1);
      this.jumlahSemester = this.jumlahSemester - 1 < 0 ? 0 : this.jumlahSemester - 1;
    },
    tambahKolom: function(){
      this.tabel.forEach((baris) => {
        baris.push({ teori: 0, praktek: 0, adaTeori: true, adaPraktek: true });
      })
    },
    hapusKolom: function(index){
      this.tabel.forEach((kolom) => {
        kolom.splice(index, 1);
      })
    },
    tambahBaris: function(){
      let tempSemester = new Array(this.jumlahSemester).fill().map(u => ({
        teori: 0,
        praktek: 0,
        adaTeori: true,
        adaPraktek: true
      }));
      this.tabel.push(tempSemester);
    },
    hapusBaris: function(index){
      this.tabel.splice(index, 1);
    },
    hitungRerata: function(sem){
      var average = 0;
      var count = 0;
      this.tabel.forEach((kolom, index) => {
        item = kolom[sem-1]
        if(item.adaTeori){
          average += item.teori;
          count++;
        }
        if(item.adaPraktek){
          average += item.praktek;
          count++
        }
      });
      average /= count;
      average = Math.round(average*10)/10;
      this.averages[sem-1] = average;
      this.gambarGrafik();
      return average;
    },
    gambarGrafik: function(){
      let cvs = document.querySelector("#graph");
      let ctx = cvs.getContext("2d");
      drawBorder(cvs, ctx);
      let h = cvs.height;
      let w = cvs.width;
      let separator = (h-marginTop) / 3;
      let max = this.averages.reduce((a,b) => { return Math.max(a,b); });
      let min = this.averages.reduce((a,b) => { return Math.min(a,b); });
      max += 5;
      max = max>=100 ? 100 : max;
      if(min >= max){
        min = max - 20;
      }
      min -= 5;
      min = min<=0 ? 0: min;
      this.tulisAngka(ctx, w, h, separator, max, min);

      horizontalSpace = (w - marginLeft) / (this.jumlahSemester);
      ctx.moveTo(0,0);
      if(!this.currentColor) this.pilihWarna();
      ctx.strokeStyle = this.currentColor;
      ctx.strokeWidth = 2;
      ctx.beginPath();
      var x,y;
      for(var i = 0; i < this.jumlahSemester; i++){
        x = marginLeft+5 + horizontalSpace * i;
        y = h-((this.averages[i]-min)/(max-min)*(h-(marginTop + marginBottom)))-marginBottom;
        ctx.lineTo(x,y);
      }
      ctx.stroke();
    },
    tulisAngka: function(ctx, w, h, separator, max, min){
      ctx.font = "10px Helvetica";
      ctx.fillStyle = "black";
      let step = Math.round(((max-min)/3)*10)/10;
      ctx.fillText(max, 4, marginTop+3);
      ctx.fillText(min, 4, h-marginBottom);
      ctx.fillText(step+min, 4, separator*2+marginTop);
      ctx.fillText(step*2+min, 4, separator+marginTop);
    },
    pilihWarna: function(){
      this.currentColor = this.colors[Math.floor(Math.random()*this.colors.length)];
    },
    ekspor: function(){
      var penyimpanan = {
        rerata: this.averages,
        jumlahSemester: this.jumlahSemester,
        nilai: []
      };
      this.mapel.forEach((mp, index) => {
        penyimpanan.nilai[index] = {
          nama: mp.nama,
          semester: []
        };
        this.tabel[index].forEach((nilai, semester) => {
          penyimpanan.nilai[index].semester[semester] = nilai;
        });
      });
      var teksPenyimpanan = JSON.stringify(penyimpanan);
      this.dataEkspor = LZString.compress(btoa(teksPenyimpanan));
    },
    impor: function(){
      var data = this.dataEkspor;
      var teksPenyimpanan = atob(LZString.decompress(data));
      var penyimpanan = JSON.parse(teksPenyimpanan);
      Object.keys(penyimpanan.nilai).forEach((index) => {
        this.mapel.splice(index, 1, {
          nama: penyimpanan.nilai[index].nama,
          gambarSendiri: false,
          warna: ""
        });
        this.tabel.splice(index, 1, penyimpanan.nilai[index].semester);
      });
      this.averages = penyimpanan.rerata;
      this.jumlahSemester = penyimpanan.jumlahSemester;
    }
  }
});

function drawBorder(cvs, ctx){
  let w = cvs.width;
  let h = cvs.height;
  ctx.clearRect(0, 0, w, h);
  ctx.lineWidth = "2";
  let separator = (h-marginTop)/3;

  ctx.strokeStyle = "#cdcdcd";
  ctx.beginPath();
  ctx.moveTo(marginLeft, marginTop);
  ctx.lineTo(w-marginRight, marginTop);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(marginLeft, marginTop+separator);
  ctx.lineTo(w-marginRight, marginTop+separator);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(marginLeft, marginTop+(separator*2));
  ctx.lineTo(w-marginRight, marginTop+(separator*2));
  ctx.stroke();

  ctx.strokeStyle = "#909090";
  ctx.beginPath();
  ctx.moveTo(marginLeft, marginTop);
  ctx.lineTo(marginLeft, h-marginBottom);
  ctx.lineTo(w-marginRight, h-marginBottom);
  ctx.moveTo(marginLeft, h-marginBottom);
  ctx.stroke();
}
