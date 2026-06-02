
export class ApiFeatures {

    constructor(mongooseQuery,searchQuery){
        this.mongooseQuery=mongooseQuery
        this.searchQuery=searchQuery 
    }

    pagination(){
    // string * number = nan== false
    if (this.searchQuery.page<=0) this.searchQuery.page=1 // عشان لو سالب يدي 1 برضو
    let pageNumber=this.searchQuery.page * 1 || 1 // ضربنا ف واحد عشان لو استرنج يدينا نان اللي هي فولس ف يطلع 1 اللي هي ديفولت
    let pageLimit=this.searchQuery.limit * 1 || 8
    if (pageLimit <= 0) pageLimit = 8
    
    this.pageNumber=pageNumber
    let skip = (pageNumber - 1) * pageLimit //عشان احسب اللي هسكبه ف المنتجات او الحاجه اللي هعرضها واحدد الجزء اللي بتعرض بس
    this.mongooseQuery.skip(skip).limit(pageLimit)
    return this//عشان اعرف اعمل دوت لاي حاجه بعد كدا زي كدا
    // pagination().sort()
    }

    filter(){
        let filterObj= {...this.searchQuery}
        let excludedFields=["page",'fields','sort','keyword','limit']
        excludedFields.forEach( val=>{
            delete filterObj[val]
        })//عشان يحذف الكلمات دي 

        const normalizedFilters = {}
        Object.entries(filterObj).forEach(([key, value]) => {
            const match = key.match(/^(.*?)(gte|gt|lte|lt)$/i)
            if (!match) {
                normalizedFilters[key] = value
                return
            }

            const field = match[1]
            const operator = `$${match[2].toLowerCase()}`
            normalizedFilters[field] = {
                ...(normalizedFilters[field] && typeof normalizedFilters[field] === 'object' ? normalizedFilters[field] : {}),
                [operator]: value,
            }
        })

        this.mongooseQuery.find(normalizedFilters)
        return this

    }

    sort(){
        if(this.searchQuery.sort){
            let sortBy= this.searchQuery.sort.split(',').join(' ')
            this.mongooseQuery.sort(sortBy)
        }
        return this
    }

    fields(){
        if(this.searchQuery.fields){
            let fields= this.searchQuery.sort.split(',').join(' ')
            this.mongooseQuery.select(fields)
        }
        return this
    }

    search(){
        if(this.searchQuery.keyword){
            this.mongooseQuery.find({
                $or: [
                    { title : { $regex: this.searchQuery.keyword } },
                    { description : { $regex: this.searchQuery.keyword } },
                ]
            })
        }
        return this
    }
}