from app.knowledge.yoga_data import POSES

def retrieve(query:str,goal:str|None=None,limit:int=4):
    q=query.lower(); scored=[]
    for p in POSES:
        score=sum(2 for g in p['goals'] if g in q or (goal and g==goal))+sum(1 for word in p['name'].lower().split() if word in q)
        if score: scored.append((score,p))
    scored.sort(key=lambda x:x[0],reverse=True)
    return [p for _,p in scored[:limit]] or POSES[:limit]
