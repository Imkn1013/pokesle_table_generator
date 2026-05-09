    
    
    
    const getlogceil=(a,b)=>{
      if(a>=1) return Infinity;
      if(a<b) return 1;
      return Math.ceil(Math.log(b)/Math.log(a)-1e-12);
    }
    const appearline=(appear_probs,appear_line,priority,friendpoint)=>{
      //_probs:メダル別合計出現率(array[number*4]),appear_line:x%出現(number),priority:メダル優先度(array[number*4])
      //ex) (0.1,0.2,0.3,0.4,80,[2,1,0,3])
      //priorityは最高個体値の出現確率に基づいて決めるとよい？
      const _probs=appear_probs.map(_=>_/100);
      const [_white,_bronze,_silver,_gold]=_probs;
      let _medal=[8,30,60];
      if(friendpoint>7) _medal=[8,20,30];
      if(friendpoint>12) _medal=[8,15,25];
      if(friendpoint>16) _medal=[8,10,20];
      let _line=1-appear_line/100;
      let times=0;
      if((1-_white)**_medal[0]<_line) return getlogceil(1-_white,_line);
      _line/=(1-_white)**_medal[0];
      times+=_medal[0];
      if((1-_bronze)**_medal[1]<_line) return getlogceil(1-_bronze,_line)+times;
      _line/=(1-_bronze)**_medal[1];
      times+=_medal[1];
      const _firstof3=priority.indexOf(Math.min(...priority.slice(0,3)));
      if((1-_probs[_firstof3])**_medal[2]<_line) return getlogceil(1-_probs[_firstof3],_line)+times;
      _line/=(1-_probs[_firstof3])**_medal[2];
      times+=_medal[2];
      const _first=priority.indexOf(Math.min(...priority));
      return getlogceil(1-_probs[_first],_line)+times;
    };
    
    export {appearline};

    const maketable=(top,main,th_width,color,_wide,_ing)=>{
      const newtable=document.createElement("table");
      newtable.style.borderCollapse = "collapse";
      newtable.border="2";
      newtable.id="table";
      
      //見出し
      for(let i=0;i<2;i++){
        const newtr=document.createElement("tr");
        newtable.appendChild(newtr);
          top[i].forEach((value,index)=>{
            const newth=document.createElement("th");
            newtr.appendChild(newth);
            const newtxt=document.createTextNode(value);
            newth.appendChild(newtxt);
              newth.colSpan=th_width[i][index];
              if(i==0) newth.rowSpan=th_width[2][index];
              newth.style.border = "2px solid black";
      });};
      
      //内容
      main.forEach((row,index)=>{
        const newtr=document.createElement("tr");
         newtable.appendChild(newtr);
        row.forEach((value,idx)=>{
          const newtd=document.createElement("td");
          newtr.appendChild(newtd);
          const newtxt=document.createTextNode(value);
          newtd.appendChild(newtxt);
            newtd.style.border = "1.5px solid black";
            if(color[index][idx]) newtd.style.backgroundColor=color[index][idx];
            const pla=idx-(_wide+_ing);
            if(idx==_wide) newtd.style.color="red";
            if(idx==_wide+1) newtd.style.color="blue";
            if(pla==2) newtd.style.backgroundColor="#D7FFD4";
            if(pla==5||pla==6) newtd.style.backgroundColor="#FDDAD4";
            if(pla==7||pla==8) newtd.style.backgroundColor="lightcyan";
            if(pla==9||pla==10) newtd.style.backgroundColor="#FDFAD4";
        });
      });
      return newtable;
    };
    
    export {maketable};

    /*

    const ari={  
    fac:(n)=>{let res=1;for(let w=1;w<=n;w++) res*=w;return res;},
    bi:function(n,k){return this.fac(n)/(this.fac(k)*this.fac(n-k));},
    perm:function(n,k){return this.fac(n)/this.fac(n-k)},
    sum:(a,b)=>a.map((v,index)=>v+b[index]),
    differ:(a,b)=>a.map((v,index)=>v-b[index]),
    mult:(a,b)=>a.map((v,index)=>v*b[index]),
    mult_scalar:(a,b)=>a.map(v=>v*b),
    total:(a)=>a.reduce((r,c)=>r+c,0)
    };

    export {ari};

    const coloring=(arr,a,b,c,d)=>{
      if(d!==undefined){
        return arr.map((val)=>{
          if(sub_gold.includes(val)) return a;
          if(sub_blue.includes(val)) return b;
          if(sub_white.includes(val)) return c;
          return d;
      })}
      const color=[0,0,0];
       arr.forEach(value=>{
         if(sub_gold.includes(value)) color[0]++;
         if(sub_blue.includes(value)) color[1]++;
         if(sub_white.includes(value)) color[2]++;
       });
      return color;
    };

    export {coloring};


    const cache = new Map();//キャッシュ
    const sleep = () => new Promise(resolve => setTimeout(resolve, 0));
    // 一瞬ブラウザに制御を戻す
    const full_pool=[7,6,4];
    const weight=[2,6,12.5];
    const probability_calculate=(n,a,b,c)=>{
    //n:抽選枠数,a:注目スキル,b:出現スキル,c:確定枠数
    //出現スキル⊂注目スキル
    //出現スキル=:必須アイテム, 注目スキル∧¬出現スキル=:禁止アイテム, ¬注目スキル=:自由アイテム
    //禁止アイテムの確率は加算しないため基本無視
    //0:残り抽選数、1:箱の状態、2:必須アイテム、3:自由アイテム、4:確率、5:確定枠数
      const state_first=[n,full_pool,b,ari.differ(full_pool,a),1,c];
      const update=(state)=>{
        if(state[4]==0) return 0;
        if(ari.total(state[2])>state[0]) return 0;//失敗
        if(state[0]==0&&ari.total(state[2])==0) return state[4];//成功
        const key = `${state[0]}|${state[1].join(',')}|
          ${state[2].join(',')}|${state[3].join(',')}|${state[5]}`;
        if (cache.has(key)) return cache.get(key)*state[4];
        let branch_prob=0;
        for(let i=2;i<4;i++){// 必須,自由を計算
        if(state[5]==0){
          state[i].forEach((value,index)=>{
            if(value==0) return 0;
            const newstate=state.map((val,id)=>id==0||id==4||id==5 ? val : [...val]);
            newstate[0]--;
            newstate[i][index]--;
            newstate[1][index]--;
            newstate[4]*=value*weight[index]/ari.total(ari.mult(state[1],weight));
            branch_prob+=update(newstate);
          });
        }else{
          const newstate=state.map((val,id)=>id==0||id==4||id==5 ? val : [...val]);
          newstate[0]--;
          newstate[i][0]--;
          newstate[1][0]--;
          newstate[4]*=state[i][0]/(state[1][0]);
          newstate[5]--;
          branch_prob+=update(newstate);
        }
        }
        cache.set(key,branch_prob/state[4]);
        return branch_prob;
      };
      const prob_total=update(state_first);
      return prob_total;
    };
    
    const probability=
    async(arr,medal,_wide,_ing,_chara_putting,_sub_putting)=>{
      await sleep();
      const subprob_putting_num=coloring(_sub_putting);
      const subprob_num=coloring(arr[0]);
      const subprob=probability_calculate(_wide, subprob_putting_num, subprob_num,medal);
     
      const a=_chara_putting.length;
      let c=0;
      if(arr[1][0]!=="") c++;
      if(arr[1][1]!=="") c++;
      const chara_prob=(()=>{
        if(c==2) return 1/25;
        if(c==1) return (5-a)/25;
        if(c==0) return (a+(5-a)**2)/25;
      })();
      
      const ing_prob=ingpattern[_ing][arr[2]]/9;
      
      return subprob*chara_prob*ing_prob;
    };

    export {probability};
    */