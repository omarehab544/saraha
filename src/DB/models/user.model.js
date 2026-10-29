import mongoose from 'mongoose';
import { GenderEnum, ProviderEnum, RoleEnum } from '../../common/enum/user.enum.js';

const userSchema = new mongoose.Schema(
  {
    fName:{
        type:String,
        require:true,
        trim:true,
        minLength:2,
        maxLength:8
    },
    lName:{
        type:String,
        require:true,
        trim:true,
        minLength:2,
        maxLength:8
    },
    email:{
        type:String,
        unique:true,
        require:true,
        sparse: true,
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        require:function(){
            return this.provider=="system"?true:false
        },
        trim:true
    },
    age:{
         type:Number,
        require:function(){
            return this.provider=="system"?true:false
        },
        trim:true,
        max:70,
        min:18
    },
    gender:{
        type:String,
        enum:Object.values(GenderEnum),
        default:GenderEnum.male


    },

    phone:String,

    profileImage:String,
    coverImage:[String],
    
    role:{
        type:String,
        enum:Object.values(RoleEnum),
        default:RoleEnum.user

    },

    provider:{
        type:String,
        enum:Object.values(ProviderEnum),
        default:ProviderEnum.system


    },
    isConfirmed:{
        type:Boolean,
        default:false
    },
    changeCredentialAT:Date

  },
  {
    timestamps: true,
    strict:true,
    strictQuery:true,
    toJSON:{virtuals:true},
     toObject:{virtuals:true}
  }
);

const userModel =mongoose.models.User || mongoose.model('User', userSchema);

export default userModel;