from app.knowledge.yoga_data import POSES

def retrieve(query:str,goal:str|None=None,limit:int=6):
    q=query.lower(); tokens=set(q.replace('-',' ').split()); scored=[]
    synonyms={'downward dog':['adho','mukha','svanasana'],'cobra':['bhujangasana'],'tree':['vrikshasana'],'child':['balasana'],'bridge':['setu','bandhasana'],'cat cow':['marjariasana'],'sleep':['better-sleep','restorative'],'relax':['stress-relief','breathing'],'flexible':['flexibility'],'strong':['strength'],'posture':['posture'],'weight':['weight-loss','weight-gain']}
    for p in POSES:
        score=0
        for g in p.get('goals',[]):
            if g in q or (goal and g==goal): score+=3
        name=(p['name']+' '+p.get('sanskrit','')).lower()
        score+=sum(2 for t in tokens if len(t)>2 and t in name)
        for key,terms in synonyms.items():
            if key in q and any(t in p.get('goals',[]) or t in name for t in terms): score+=3
        if score: scored.append((score,p))
    scored.sort(key=lambda x:x[0],reverse=True)
    return [p for _,p in scored[:limit]] or POSES[:limit]
